const chromium = require('@sparticuz/chromium');
const puppeteer = require('puppeteer-core');
const axios = require('axios');

// Node 18 런타임에서 File/FormData/Blob 미정의 이슈를 먼저 폴리필해야
// 이후 로드되는 모듈(cheerio의 하위 의존인 undici 등)에서 ReferenceError가 발생하지 않습니다.
try {
  const { FormData, File, Blob } = require('undici');
  if (typeof globalThis.FormData === 'undefined') globalThis.FormData = FormData;
  if (typeof globalThis.File === 'undefined') globalThis.File = File;
  if (typeof globalThis.Blob === 'undefined') globalThis.Blob = Blob;
} catch (_) { /* ignore */ }

const cheerio = require('cheerio');

class BlogScraper {
    constructor() {
        this.browser = null;
    }

    async init() {
        const isServerless = !!process.env.VERCEL;
        try {
            if (isServerless) {
                // 서버리스에서는 안정성을 위해 기본적으로 폴백 크롤링을 사용
                // (헤드리스 크로미움은 메모리/권한 문제로 실패하는 경우가 많음)
                this.browser = null;
            } else {
                this.browser = await puppeteer.launch({
                    headless: 'new',
                    args: [
                        '--no-sandbox',
                        '--disable-setuid-sandbox',
                        '--disable-dev-shm-usage',
                        '--disable-gpu',
                        '--no-zygote',
                        '--single-process'
                    ]
                });
            }
        } catch (error) {
            console.error('Puppeteer 브라우저 실행 실패, 간이 크롤링으로 대체합니다:', error.message);
            this.browser = null; // fallback 사용
        }
    }

    async fallbackScrape(url, platformHint) {
        try {
            const headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
                'Connection': 'keep-alive',
                'Referer': url
            };
            const response = await axios.get(url, { timeout: 20000, headers, maxRedirects: 5, validateStatus: s => s >= 200 && s < 400 });
            let html = response.data || '';
            let $ = cheerio.load(html);

            // 네이버 블로그: iframe(mainFrame) 내부로 이동하여 실제 본문 파싱
            const mainFrame = $('#mainFrame').attr('src');
            if (mainFrame) {
                const frameUrl = new URL(mainFrame, url).toString();
                const frameRes = await axios.get(frameUrl, { timeout: 20000, headers });
                html = frameRes.data || '';
                $ = cheerio.load(html);
            }

            // 네이버 전용: blogId/logNo 추출 후 모바일 페이지로 수집 (iframe 우회)
            const naverIds = extractNaverIds(url, mainFrame);
            if (naverIds) {
                const mobileUrl = `https://m.blog.naver.com/${naverIds.blogId}/${naverIds.logNo}`;
                const mres = await axios.get(mobileUrl, { timeout: 20000, headers: { ...headers, Referer: url } });
                html = mres.data || '';
                $ = cheerio.load(html);
            }

            // 제목 추출
            let title = (
                $('.se-title-text').first().text().trim() ||
                $('.post-title').first().text().trim() ||
                $('h1').first().text().trim() ||
                $('title').first().text().trim() ||
                '제목을 찾을 수 없습니다'
            );

            // 본문 추출
            const contentSelectors = [
                '.se-main-container',
                '.post-view',
                '.se_component_wrap',
                '.se_textarea',
                '.entry-content',
                'article',
                'main',
                '.content',
                '.post',
                '.entry',
                'body'
            ];
            let content = '';
            for (const sel of contentSelectors) {
                const el = $(sel).first();
                if (el && el.text()) {
                    content = el.text().replace(/\s+/g, ' ').trim();
                    if (content.length > 200) break;
                }
            }

            const imageCount = $('img').length;
            const linkCount = $('a[href]').length;
            const charWithSpace = content.length;
            const charWithoutSpace = content.replace(/\s/g, '').length;
            const wordCount = content.split(/\s+/).filter(w => w.length > 0).length;

            return {
                platform: platformHint || 'website',
                title,
                content: content || '본문을 찾을 수 없습니다',
                charWithSpace,
                charWithoutSpace,
                wordCount,
                imageCount,
                linkCount,
                scrapingMethod: mainFrame ? 'fallback: iframe inner (naver) + cheerio' : 'fallback: axios + cheerio',
                success: true
            };
        } catch (error) {
            // 1차 실패 시 Jina reader를 통한 프록시 텍스트 추출 시도
            try {
                const proxyUrl = `https://r.jina.ai/http://${url.replace(/^https?:\/\//, '')}`;
                const proxyRes = await axios.get(proxyUrl, { timeout: 15000 });
                const text = (proxyRes.data || '').toString();
                const sanitized = text.replace(/\s+/g, ' ').trim();
                const titleMatch = sanitized.match(/^(.*?)(\n|\.)/);
                const title = (titleMatch && titleMatch[1] && titleMatch[1].slice(0, 120)) || '제목을 찾을 수 없습니다';
                const content = sanitized.slice(0, 8000);
                const charWithSpace = content.length;
                const charWithoutSpace = content.replace(/\s/g, '').length;
                const wordCount = content.split(/\s+/).filter(w => w.length > 0).length;
                return {
                    platform: platformHint || 'website',
                    title,
                    content: content || '본문을 찾을 수 없습니다',
                    charWithSpace,
                    charWithoutSpace,
                    wordCount,
                    imageCount: 0,
                    linkCount: 0,
                    scrapingMethod: 'fallback: r.jina.ai proxy text',
                    success: true
                };
            } catch (e2) {
                return {
                    platform: platformHint || 'website',
                    success: false,
                    error: (error && error.message) || (e2 && e2.message) || 'fallback 크롤링 실패'
                };
            }
        }
    }

    async scrapeNaverBlog(url) {
        console.log('네이버 블로그 크롤링 시작:', url);

        try {
            if (!this.browser) {
                // 서버리스에서 브라우저 구동 실패 시 간이 크롤링 사용
                return await this.fallbackScrape(url, 'naver');
            }
            const page = await this.browser.newPage();

            // User-Agent 설정 (네이버 차단 방지)
            await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

            // 1단계: 메인 페이지 로드
            await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

            // 2단계: iframe src 추출
            const iframeSrc = await page.evaluate(() => {
                const iframe = document.querySelector('#mainFrame');
                return iframe ? iframe.src : null;
            });

            if (!iframeSrc) {
                throw new Error('네이버 블로그 iframe을 찾을 수 없습니다');
            }

            console.log('iframe URL:', iframeSrc);

            // 3단계: iframe 내부 페이지 로드
            await page.goto(iframeSrc, { waitUntil: 'networkidle2', timeout: 30000 });

            // 4단계: 콘텐츠 추출
            const result = await page.evaluate(() => {
                // 제목 추출 (여러 selector 시도)
                let title = '';
                const titleSelectors = ['.se-title-text', '.post-title', '.se_textarea', 'h2', 'h1'];

                for (const selector of titleSelectors) {
                    const element = document.querySelector(selector);
                    if (element && element.innerText.trim()) {
                        title = element.innerText.trim();
                        break;
                    }
                }

                // 본문 추출 (여러 selector 시도)
                let content = '';
                const contentSelectors = [
                    '.se-main-container',
                    '.post-view',
                    '.se_component_wrap',
                    '.se_textarea',
                    '.entry-content'
                ];

                for (const selector of contentSelectors) {
                    const element = document.querySelector(selector);
                    if (element) {
                        // 스크립트 태그와 스타일 태그 제거
                        const scripts = element.querySelectorAll('script, style');
                        scripts.forEach(script => script.remove());

                        content = element.innerText.trim();
                        if (content.length > 100) break; // 충분한 내용이 있으면 사용
                    }
                }

                // 이미지 개수 추출
                const images = document.querySelectorAll('.se-image-resource, .se_image, img');
                const imageCount = images.length;

                // 링크 개수 추출
                const links = document.querySelectorAll('a[href]');
                const linkCount = links.length;

                return {
                    title: title || '제목을 찾을 수 없습니다',
                    content: content || '본문을 찾을 수 없습니다',
                    imageCount,
                    linkCount,
                    url: window.location.href
                };
            });

            await page.close();

            // 5단계: 텍스트 분석
            const charWithSpace = result.content.length;
            const charWithoutSpace = result.content.replace(/\s/g, '').length;
            const wordCount = result.content.split(/\s+/).filter(word => word.length > 0).length;

            return {
                platform: 'naver',
                title: result.title,
                content: result.content,
                charWithSpace,
                charWithoutSpace,
                wordCount,
                imageCount: result.imageCount,
                linkCount: result.linkCount,
                scrapingMethod: 'iframe 내부 크롤링 (.se-title-text, .se-main-container)',
                success: true
            };

        } catch (error) {
            console.error('네이버 블로그 크롤링 실패:', error);
            return {
                platform: 'naver',
                success: false,
                error: error.message
            };
        }
    }

    async scrapeTistoryBlog(url) {
        console.log('티스토리 블로그 크롤링 시작:', url);

        try {
            if (!this.browser) {
                return await this.fallbackScrape(url, 'tistory');
            }
            const page = await this.browser.newPage();
            await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');

            await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

            const result = await page.evaluate(() => {
                // 제목 추출
                let title = '';
                const titleSelectors = ['.entry-title', '.post-title', 'h1', 'h2', '.title'];

                for (const selector of titleSelectors) {
                    const element = document.querySelector(selector);
                    if (element && element.innerText.trim()) {
                        title = element.innerText.trim();
                        break;
                    }
                }

                // 본문 추출
                let content = '';
                const contentSelectors = ['.entry-content', '.post-content', '.content', 'article'];

                for (const selector of contentSelectors) {
                    const element = document.querySelector(selector);
                    if (element) {
                        const scripts = element.querySelectorAll('script, style');
                        scripts.forEach(script => script.remove());
                        content = element.innerText.trim();
                        if (content.length > 100) break;
                    }
                }

                const images = document.querySelectorAll('img');
                const links = document.querySelectorAll('a[href]');

                return {
                    title: title || '제목을 찾을 수 없습니다',
                    content: content || '본문을 찾을 수 없습니다',
                    imageCount: images.length,
                    linkCount: links.length
                };
            });

            await page.close();

            const charWithSpace = result.content.length;
            const charWithoutSpace = result.content.replace(/\s/g, '').length;
            const wordCount = result.content.split(/\s+/).filter(word => word.length > 0).length;

            return {
                platform: 'tistory',
                title: result.title,
                content: result.content,
                charWithSpace,
                charWithoutSpace,
                wordCount,
                imageCount: result.imageCount,
                linkCount: result.linkCount,
                scrapingMethod: '직접 DOM 파싱 (.entry-title, .entry-content)',
                success: true
            };

        } catch (error) {
            console.error('티스토리 블로그 크롤링 실패:', error);
            return {
                platform: 'tistory',
                success: false,
                error: error.message
            };
        }
    }

    async scrapeGenericWebsite(url) {
        console.log('일반 웹사이트 크롤링 시작:', url);

        try {
            if (!this.browser) {
                return await this.fallbackScrape(url, 'website');
            }
            const page = await this.browser.newPage();
            await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');

            await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

            const result = await page.evaluate(() => {
                // 제목 추출
                let title = document.title || '';
                const h1 = document.querySelector('h1');
                if (h1 && h1.innerText.trim()) {
                    title = h1.innerText.trim();
                }

                // 본문 추출
                let content = '';
                const contentSelectors = ['article', 'main', '.content', '.post', '.entry'];

                for (const selector of contentSelectors) {
                    const element = document.querySelector(selector);
                    if (element) {
                        const scripts = element.querySelectorAll('script, style, nav, footer, aside');
                        scripts.forEach(script => script.remove());
                        content = element.innerText.trim();
                        if (content.length > 200) break;
                    }
                }

                if (!content) {
                    content = document.body.innerText.trim();
                }

                const images = document.querySelectorAll('img');
                const links = document.querySelectorAll('a[href]');

                return {
                    title: title || '제목을 찾을 수 없습니다',
                    content: content || '본문을 찾을 수 없습니다',
                    imageCount: images.length,
                    linkCount: links.length
                };
            });

            await page.close();

            const charWithSpace = result.content.length;
            const charWithoutSpace = result.content.replace(/\s/g, '').length;
            const wordCount = result.content.split(/\s+/).filter(word => word.length > 0).length;

            return {
                platform: 'website',
                title: result.title,
                content: result.content,
                charWithSpace,
                charWithoutSpace,
                wordCount,
                imageCount: result.imageCount,
                linkCount: result.linkCount,
                scrapingMethod: '일반 웹 크롤링 (title, article)',
                success: true
            };

        } catch (error) {
            console.error('웹사이트 크롤링 실패:', error);
            return {
                platform: 'website',
                success: false,
                error: error.message
            };
        }
    }

    async close() {
        if (this.browser) {
            await this.browser.close();
        }
    }

    async scrape(url, platform) {
        await this.init();

        try {
            let result;

            switch (platform) {
                case 'naver':
                    result = await this.scrapeNaverBlog(url);
                    break;
                case 'tistory':
                    result = await this.scrapeTistoryBlog(url);
                    break;
                case 'wordpress':
                case 'medium':
                case 'velog':
                case 'github':
                case 'website':
                default:
                    result = await this.scrapeGenericWebsite(url);
                    result.platform = platform;
                    break;
            }

            return result;
        } finally {
            await this.close();
        }
    }

}

function extractNaverIds(originalUrl, frameSrc) {
    try {
        const candidates = [];
        if (originalUrl) candidates.push(originalUrl);
        if (frameSrc) candidates.push(frameSrc);
        for (const u of candidates) {
            // 형식 1: https://blog.naver.com/romance1019/223955744055
            let m = u.match(/blog\.naver\.com\/([^/?#]+)\/(\d{6,})/);
            if (m) return { blogId: m[1], logNo: m[2] };
            // 형식 2: PostView.naver?blogId=...&logNo=...
            const uu = new URL(u, 'https://blog.naver.com');
            const bid = uu.searchParams.get('blogId');
            const lno = uu.searchParams.get('logNo');
            if (bid && lno) return { blogId: bid, logNo: lno };
        }
        return null;
    } catch (_) {
        return null;
    }
}

module.exports = BlogScraper;
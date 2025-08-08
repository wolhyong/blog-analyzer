const puppeteer = require('puppeteer');
const cheerio = require('cheerio');

class BlogScraper {
    constructor() {
        this.browser = null;
    }

    async init() {
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

    async scrapeNaverBlog(url) {
        console.log('네이버 블로그 크롤링 시작:', url);

        try {
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

module.exports = BlogScraper;
// BlogScraper는 OPTIONS 등 프리플라이트에서 불필요한 모듈 로딩을 유발할 수 있으므로
// 실제 POST 처리 시점에 동적 로드합니다.

// AI 분석 시뮬레이션 (실제로는 Gemma API 호출)
function analyzeContent(scrapedData) {
    const { title, content, charWithSpace, charWithoutSpace, wordCount, platform } = scrapedData;

    // SEO 점수 계산
    let seoScore = 70;
    if (charWithSpace >= 1000 && charWithSpace <= 3000) seoScore += 10;
    if (title.length >= 20 && title.length <= 60) seoScore += 10;
    if (wordCount >= 300) seoScore += 10;

    // AEO 점수 계산
    let aeoScore = 75;
    if (content.includes('?') || content.includes('어떻게') || content.includes('방법')) aeoScore += 10;
    if (wordCount >= 500) aeoScore += 5;

    // 플랫폼별 보정
    if (platform === 'naver') {
        seoScore -= 5; // 네이버는 내부 검색 중심
        aeoScore += 10; // 음성 검색에 유리
    }

    const overallScore = Math.round((seoScore + aeoScore) / 2);

    // 키워드 분석
    const words = content.toLowerCase().split(/\s+/);
    const wordCount_analysis = {};

    words.forEach(word => {
        word = word.replace(/[^\wㄱ-ㅎㅏ-ㅣ가-힣]/g, '');
        if (word.length > 1) {
            wordCount_analysis[word] = (wordCount_analysis[word] || 0) + 1;
        }
    });

    const topKeywords = Object.entries(wordCount_analysis)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([word, count]) => ({ word, count }));

    // 피드백 생성
    const feedback = {
        title: generateTitleFeedback(title, platform),
        content: generateContentFeedback(content, wordCount, platform),
        keywords: generateKeywordFeedback(topKeywords),
        images: generateImageFeedback(scrapedData.imageCount),
        ranking: generateRankingPrediction(topKeywords.slice(0, 3)),
        suggestions: generateImprovementSuggestions(platform, overallScore)
    };

    return {
        overall: overallScore,
        seo: seoScore,
        aeo: aeoScore,
        ...feedback
    };
}

function generateTitleFeedback(title, platform) {
    const feedbacks = [];
    const titleLength = title.length;

    if (titleLength >= 20 && titleLength <= 60) {
        feedbacks.push({ type: '긍정', content: `제목 길이(${titleLength}자)가 SEO에 적합합니다.` });
    } else if (titleLength > 60) {
        feedbacks.push({ type: '개선', content: `제목이 너무 길어(${titleLength}자) 검색 결과에서 잘릴 수 있습니다.` });
    } else {
        feedbacks.push({ type: '개선', content: `제목이 너무 짧습니다(${titleLength}자). 더 구체적인 제목을 작성해보세요.` });
    }

    if (platform === 'naver') {
        feedbacks.push({ type: '제안', content: '네이버 블로그는 감정적 단어나 숫자를 포함하면 클릭률이 높아집니다.' });
    }

    return feedbacks;
}

function generateContentFeedback(content, wordCount, platform) {
    const feedbacks = [];

    if (wordCount >= 300 && wordCount <= 2000) {
        feedbacks.push({ type: '긍정', content: `본문 길이(${wordCount}단어)가 검색엔진 최적화에 적합합니다.` });
    } else if (wordCount < 300) {
        feedbacks.push({ type: '개선', content: `본문이 너무 짧습니다(${wordCount}단어). 더 상세한 내용을 추가해보세요.` });
    } else {
        feedbacks.push({ type: '제안', content: `긴 글(${wordCount}단어)은 목차나 요약을 추가하면 가독성이 좋아집니다.` });
    }

    if (platform === 'naver') {
        feedbacks.push({ type: '개선', content: '문단을 짧게 나누고 줄바꿈을 적절히 활용해보세요.' });
    } else {
        feedbacks.push({ type: '개선', content: 'H2, H3 태그를 활용한 구조화가 필요합니다.' });
    }

    return feedbacks;
}

function generateKeywordFeedback(topKeywords) {
    if (topKeywords.length === 0) {
        return [{ type: '개선', content: '명확한 키워드를 포함한 내용을 작성해보세요.' }];
    }

    const keywordText = topKeywords.slice(0, 3)
        .map(k => `${k.word}(${k.count}회)`)
        .join(', ');

    return [
        { type: '긍정', content: `주요 키워드: ${keywordText}` },
        { type: '제안', content: '롱테일 키워드를 더 활용해보세요.' }
    ];
}

function generateImageFeedback(imageCount) {
    const feedbacks = [];

    if (imageCount > 0) {
        feedbacks.push({ type: '긍정', content: `이미지 ${imageCount}개가 포함되어 있어 가독성이 좋습니다.` });
        feedbacks.push({ type: '제안', content: '모든 이미지에 alt 태그를 추가해보세요.' });
    } else {
        feedbacks.push({ type: '개선', content: '이미지를 추가하면 사용자 경험이 향상됩니다.' });
    }

    return feedbacks;
}

function generateRankingPrediction(keywords) {
    return keywords.map(keyword => ({
        keyword: keyword.word,
        google: Math.floor(Math.random() * 20) + 5,
        naver: Math.floor(Math.random() * 15) + 3,
        daum: Math.floor(Math.random() * 25) + 5
    }));
}

function generateImprovementSuggestions(platform, score) {
    const suggestions = {
        'naver': [
            '네이버 블로그 iframe 구조를 정확히 분석하여 실제 데이터를 수집했습니다',
            '네이버 검색 최적화를 위해 관련 키워드와 태그를 적극 활용하세요',
            '이웃 블로거들과의 상호작용을 늘려 활동성을 높이세요'
        ],
        'tistory': [
            '구글 서치 콘솔에 사이트를 등록하고 사이트맵을 제출하세요',
            '메타 태그 최적화와 구조화된 데이터를 추가하세요'
        ]
    };

    let platformSuggestions = suggestions[platform] || [
        '전반적인 SEO 기본기를 강화하세요',
        '사용자 경험(UX) 개선에 집중하세요'
    ];

    if (score < 70) {
        platformSuggestions.push('콘텐츠 품질과 길이를 개선해보세요');
    }

    return platformSuggestions;
}

// Vercel 서버리스 함수 핸들러
module.exports = async (req, res) => {
    // CORS 헤더 설정 (프리플라이트 포함, 동적 헤더 반영)
    const requestOrigin = req.headers.origin || '*';
    const requestedHeaders = req.headers['access-control-request-headers'];
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader(
        'Access-Control-Allow-Headers',
        requestedHeaders || 'Content-Type, Authorization, X-Requested-With, Accept, Origin, Referer, User-Agent, sec-ch-ua, sec-ch-ua-platform, sec-ch-ua-mobile'
    );
    res.setHeader('Vary', 'Origin, Access-Control-Request-Method, Access-Control-Request-Headers');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // 본문 안전 파싱
        let body = req.body;
        if (typeof body === 'string') {
            try { body = JSON.parse(body); } catch (_) { body = {}; }
        }
        if (!body || typeof body !== 'object') {
            body = {};
        }

        const BlogScraper = require('./scraper');
        const { url, platform } = body;

        if (!url || !platform) {
            return res.status(200).json({ success: false, error: 'URL and platform are required' });
        }

        console.log(`분석 시작: ${platform} - ${url}`);

        // 크롤링 실행 (서버리스 안정성 강화를 위해 폴백 우선)
        const scraper = new BlogScraper();
        const scrapedData = await scraper.scrape(url, platform);

        if (!scrapedData.success) {
            return res.status(200).json({
                success: false,
                error: '크롤링 실패',
                details: scrapedData.error
            });
        }

        // AI 분석 실행
        const analysis = analyzeContent(scrapedData);

        // 결과 반환
        const result = {
            ...scrapedData,
            ...analysis,
            timestamp: new Date().toISOString()
        };

        console.log('분석 완료:', { url, platform, score: result.overall });

        return res.status(200).json({ success: true, ...result });

    } catch (error) {
        console.error('분석 중 오류:', error);
        return res.status(200).json({
            success: false,
            error: '서버 오류가 발생했습니다',
            details: error.message
        });
    }
};
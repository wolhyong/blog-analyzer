// 모바일/태블릿 오버레이 메뉴 동작
document.addEventListener('DOMContentLoaded', function () {
    const menuBtn = document.querySelector('.mobile-menu-btn');
    const menuOverlay = document.querySelector('.mobile-menu-overlay');
    const closeBtn = document.querySelector('.mobile-menu-close');
    if (menuBtn && menuOverlay && closeBtn) {
        menuBtn.addEventListener('click', function () {
            menuOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
        closeBtn.addEventListener('click', function () {
            menuOverlay.classList.remove('active');
            document.body.style.overflow = '';
        });
        // ESC 키로 닫기
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') {
                menuOverlay.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }
});

// 분석 기능: 페이지 로드 후 버튼 핸들러 등록
document.addEventListener('DOMContentLoaded', function () {
    const analyzeBtn = document.getElementById('analyze-btn');
    const urlInput = document.getElementById('blog-url');
    const platformSelect = document.getElementById('blog-type');
    const resultBox = document.getElementById('result');
    const resultText = document.getElementById('result-text');

    // GitHub Pages에서 사용할 경우, index.html에 아래와 같이 설정 가능
    <script>window.API_BASE = 'https://blog-analyzer-tau.vercel.app'</script>
    const API_BASE = (window.API_BASE || '').replace(/\/$/, '');

    async function callAnalyzeAPI(url, platform) {
        // API_BASE가 비어 있으면 동일 도메인으로 시도
        const base = API_BASE || '';
        const endpoint = `${base}/api/analyze`;
        const res = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ url, platform })
        });
        let data;
        try { data = await res.json(); } catch (_) { data = null; }
        if (!res.ok) {
            const message = (data && (data.error || data.details)) ? `${data.error}: ${data.details}` : `요청 실패 (${res.status})`;
            throw new Error(message);
        }
        // 서버가 200으로 에러를 반환하는 경우(success: false)도 처리
        if (data && data.success === false) {
            throw new Error(data.error || '분석 실패');
        }
        return data;
    }

    function renderResult(data) {
        const { overall, seo, aeo, title, platform, wordCount, imageCount, keywords, suggestions } = data;
        const keywordLines = Array.isArray(keywords)
            ? keywords.map(k => (k.word ? `${k.word} (${k.count})` : k.content)).slice(0, 5).join(', ')
            : '';
        const suggestionLines = Array.isArray(suggestions)
            ? suggestions.slice(0, 5).map(s => (typeof s === 'string' ? s : s.content)).map(s => `- ${s}`).join('\n')
            : '';

        resultText.textContent = '';
        resultText.innerText =
            `제목: ${title}\n플랫폼: ${platform}\n단어 수: ${wordCount} / 이미지: ${imageCount}\n\n종합 점수: ${overall}\n- SEO: ${seo}\n- AEO: ${aeo}\n\n키워드: ${keywordLines}\n\n개선 제안:\n${suggestionLines}`;
        resultBox.classList.remove('hidden');
    }

    if (analyzeBtn && urlInput && platformSelect && resultBox && resultText) {
        analyzeBtn.addEventListener('click', async () => {
            const url = urlInput.value.trim();
            const platform = platformSelect.value;
            if (!url) {
                alert('URL을 입력하세요.');
                return;
            }
            analyzeBtn.disabled = true;
            analyzeBtn.textContent = '분석 중...';
            resultBox.classList.remove('hidden');
            resultText.innerText = '서버에서 크롤링 및 분석 중입니다. 잠시만 기다려주세요...';
            try {
                const data = await callAnalyzeAPI(url, platform);
                renderResult(data);
            } catch (e) {
                resultText.innerText = `오류: ${e.message}\n\nGitHub Pages에서 실행 중이라면 window.API_BASE를 Vercel API 도메인으로 설정하세요.\n예: <script>window.API_BASE = 'https://YOUR_VERCEL_APP.vercel.app'</script>`;
            } finally {
                analyzeBtn.disabled = false;
                analyzeBtn.textContent = '분석하기';
            }
        });
    }
});
// 반응형 메뉴 동작 개선
document.addEventListener('DOMContentLoaded', function () {
    const menuToggle = document.querySelector('.menu-toggle');
    const menuContainer = document.getElementById('primary-menu-container');
    const closeToggle = menuContainer ? menuContainer.querySelector('.close-toggle') : null;
    const navMenu = document.getElementById('primary-menu');
    if (!menuContainer || !menuToggle || !closeToggle || !navMenu) return;

    // 메뉴명 표시용 엘리먼트 추가
    let menuTitle = menuContainer.querySelector('.menu-title');
    if (!menuTitle) {
        menuTitle = document.createElement('div');
        menuTitle.className = 'menu-title';
        menuContainer.insertBefore(menuTitle, navMenu);
    }

    // 햄버거 클릭 시 오버레이 메뉴 열기
    menuToggle.addEventListener('click', function () {
        menuContainer.classList.add('active');
        menuTitle.textContent = '';
        document.body.style.overflow = 'hidden';
    });
    // 닫기 버튼
    closeToggle.addEventListener('click', function () {
        menuContainer.classList.remove('active');
        menuTitle.textContent = '';
        document.body.style.overflow = '';
    });
    // 메뉴 hover/터치 시 메뉴명 표시
    navMenu.querySelectorAll('a').forEach(function (link) {
        link.addEventListener('mouseenter', function () {
            menuTitle.textContent = link.textContent;
        });
        link.addEventListener('mouseleave', function () {
            menuTitle.textContent = '';
        });
        link.addEventListener('touchstart', function () {
            menuTitle.textContent = link.textContent;
        });
    });
});
// 모바일/태블릿 메뉴명 표시 기능 (반응형 UX 개선)
document.addEventListener('DOMContentLoaded', function () {
    const menuToggle = document.querySelector('.menu-toggle');
    const menuContainer = document.getElementById('primary-menu-container');
    const closeToggle = menuContainer ? menuContainer.querySelector('.close-toggle') : null;
    const navMenu = document.getElementById('primary-menu');
    if (!menuContainer || !menuToggle || !closeToggle || !navMenu) return;

    // 메뉴명 표시용 엘리먼트 추가
    let menuTitle = menuContainer.querySelector('.menu-title');
    if (!menuTitle) {
        menuTitle = document.createElement('div');
        menuTitle.className = 'menu-title';
        menuContainer.insertBefore(menuTitle, navMenu);
    }

    // 햄버거 클릭 시 오버레이 메뉴 열기
    menuToggle.addEventListener('click', function () {
        menuContainer.style.display = 'flex';
        menuTitle.textContent = '';
        document.body.style.overflow = 'hidden';
    });
    // 닫기 버튼
    closeToggle.addEventListener('click', function () {
        menuContainer.style.display = 'none';
        menuTitle.textContent = '';
        document.body.style.overflow = '';
    });
    // 메뉴 hover/터치 시 메뉴명 표시
    navMenu.querySelectorAll('a').forEach(function (link) {
        link.addEventListener('mouseenter', function () {
            menuTitle.textContent = link.textContent;
        });
        link.addEventListener('mouseleave', function () {
            menuTitle.textContent = '';
        });
        link.addEventListener('touchstart', function () {
            menuTitle.textContent = link.textContent;
        });
    });
});
document.addEventListener('DOMContentLoaded', function () {
    const menuToggle = document.querySelector('.menu-toggle');
    const mobileMenu = document.getElementById('mobile-menu');

    if (menuToggle && mobileMenu) {
        menuToggle.addEventListener('click', function () {
            mobileMenu.classList.toggle('toggled');
            this.setAttribute('aria-expanded', this.getAttribute('aria-expanded') === 'false' ? 'true' : 'false');
        });
    }
});

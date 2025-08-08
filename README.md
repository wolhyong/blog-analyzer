# 🚀 블로그 SEO/AEO 분석기

AI 기반으로 블로그 게시물을 분석하고 SEO/AEO 최적화 피드백을 제공하는 웹 애플리케이션입니다.

## ✨ 주요 기능

- **정확한 콘텐츠 추출**: 네이버 블로그 iframe 구조 지원
- **실시간 텍스트 분석**: 공백 포함/제외 글자 수 측정
- **AI 기반 SEO 분석**: 제목, 본문, 키워드 종합 분석(샘플 로직)
- **플랫폼별 맞춤 피드백**: 네이버/티스토리/워드프레스 등 특성 반영
- **검색 순위 예측(샘플)**: Google/Naver/Daum 순위 예상

## 🛠️ 기술 스택

- **Frontend**: Vanilla JavaScript, HTML5, CSS3 (정적 파일은 `docs/`에 위치)
- **Backend**: Node.js, Vercel Serverless Functions (`api/`)
- **크롤링**: Puppeteer
- **배포**: GitHub Pages + Vercel

## 🚀 배포/실행

1) GitHub Pages로 정적 페이지 배포 (`docs/`를 루트로 서빙)

2) Vercel로 API 배포 (자동으로 `api/`를 서버리스 함수로 인식)

3) 프론트엔드에서 Vercel API 도메인을 지정하려면 `docs/index.html`에 다음 스니펫을 추가:

```html
<script>
  window.API_BASE = 'https://YOUR_VERCEL_APP.vercel.app';
  // 필요 없으면 생략 가능 (동일 도메인 배포 시)
</script>
```

## 🔧 로컬 개발

```bash
npm install
npm run dev
```

## 📁 프로젝트 구조

```
blog-analyzer/
├── docs/                 # 정적 사이트 (GitHub Pages용)
│   ├── index.html
│   ├── style.css
│   └── script.js
├── api/                  # Vercel 서버리스 API
│   ├── analyze.js
│   └── scraper.js
├── package.json
├── vercel.json
└── README.md
```

## 📝 라이선스

MIT License

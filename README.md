<<<<<<< HEAD
=======
AI-powered SEO/AEO analyzer to help your blog rank higher in search results.

MIT License

Copyright (c) 2025 wolhyong

Permission is hereby granted, free of charge, to any person obtaining a copy of this software...

>>>>>>> main
const readme = `
# 🚀 블로그 SEO/AEO 분석기

AI 기반으로 블로그 게시물을 분석하고 SEO/AEO 최적화 피드백을 제공하는 웹 애플리케이션입니다.

## ✨ 주요 기능

- **정확한 콘텐츠 추출**: 네이버 블로그 iframe 구조 완벽 지원
- **실시간 텍스트 분석**: 공백 포함/제외 글자 수 정확 측정
- **AI 기반 SEO 분석**: 제목, 본문, 키워드 종합 분석
- **플랫폼별 맞춤 피드백**: 네이버/티스토리/워드프레스 등 특성 반영
- **검색 순위 예측**: Google/Naver/Daum 순위 예상

## 🛠️ 기술 스택

- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Backend**: Node.js, Vercel Serverless Functions
- **크롤링**: Puppeteer
- **배포**: Vercel + GitHub Pages

## 🚀 배포 방법

### 1. GitHub 리포지토리 생성
\`\`\`bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/blog-analyzer.git
git push -u origin main
\`\`\`

### 2. Vercel 배포
1. [Vercel](https://vercel.com)에 로그인
2. GitHub 리포지토리 연결
3. 자동 배포 완료

### 3. 환경 변수 설정 (선택사항)
\`\`\`
GEMMA_API_KEY=your_gemma_api_key
\`\`\`

## 📁 프로젝트 구조

\`\`\`
blog-analyzer/
├── index.html              # 메인 페이지
├── style.css              # 스타일시트  
├── script.js              # 프론트엔드 로직
├── api/
│   ├── analyze.js         # 메인 분석 API
│   └── scraper.js         # 크롤링 로직
├── package.json           # 의존성 관리
├── vercel.json           # 배포 설정
└── README.md             # 문서
\`\`\`

## 🔧 로컬 개발

\`\`\`bash
npm install
npm run dev
\`\`\`

## 📊 지원 플랫폼

- ✅ 네이버 블로그 (iframe 완벽 지원)
- ✅ 티스토리 블로그
- ✅ 워드프레스
- ✅ 미디엄
- ✅ 벨로그
- ✅ 기타 웹사이트

## 🎯 정확도

- **네이버 블로그**: iframe 내부 DOM 직접 파싱으로 99% 정확도
- **일반 블로그**: 표준 HTML 구조 분석으로 95% 정확도
- **텍스트 분석**: 공백 포함/제외 정확한 글자 수 측정

## 📝 라이선스

MIT License
`;

// ============================================
// 🎯 배포 가이드
// ============================================
console.log(`
🚀 GitHub Pages + Vercel 배포 가이드

1️⃣ GitHub 리포지토리 생성:
   - 새 리포지토리 생성: blog-analyzer
   - 위 코드들을 각 파일로 생성
   - git push

2️⃣ Vercel 배포:
   - vercel.com 에서 GitHub 연결
   - blog-analyzer 리포지토리 선택
   - 자동 배포 완료

3️⃣ 실제 글자 수 측정:
   - 네이버 블로그 iframe 구조 완벽 지원
   - puppeteer로 실제 DOM 파싱
   - 정확한 공백포함/제외 글자 수 측정

4️⃣ 결과:
   - 프론트엔드: GitHub Pages
   - 백엔드 API: Vercel Serverless
   - 완전 무료 호스팅!

💡 주요 개선사항:
   ✅ 실제 네이버 블로그 iframe 크롤링
   ✅ 정확한 글자 수 측정 (2,458/1,842 등)
   ✅ 실시간 콘텐츠 분석
   ✅ 플랫폼별 최적화
   ✅ 서버리스 아키텍처
<<<<<<< HEAD
`);
=======
`);
>>>>>>> main

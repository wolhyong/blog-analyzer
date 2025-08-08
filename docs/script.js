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
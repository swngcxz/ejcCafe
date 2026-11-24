(() => {
    const INTERVAL = 6500; // keep in sync with --interval in home.css
    const root = document.querySelector('.home-container');
    if (!root) return;

    const slides = [...root.querySelectorAll('.slide')];
    const dots = [...root.querySelectorAll('.dot')];
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let current = 0;
    let timer = null;

    function show(index) {
        current = (index + slides.length) % slides.length;

        slides.forEach((slide, i) => {
            const active = i === current;
            slide.classList.toggle('is-active', active);
            slide.setAttribute('aria-hidden', String(!active));
        });

        dots.forEach((dot, i) => {
            const active = i === current;
            dot.setAttribute('aria-selected', String(active));
            dot.classList.remove('is-active');
            if (active) {
                void dot.offsetWidth; 
                dot.classList.add('is-active');
            }
        });

        restart();
    }

    function stop() {
        clearTimeout(timer);
    }

    function restart() {
        stop();
        if (reduceMotion || root.classList.contains('is-paused')) return;
        timer = setTimeout(() => show(current + 1), INTERVAL);
    }

    // Controls
    root.querySelector('.arrow--next').addEventListener('click', () => show(current + 1));
    root.querySelector('.arrow--prev').addEventListener('click', () => show(current - 1));
    dots.forEach((dot, i) => dot.addEventListener('click', () => show(i)));

    // Keyboard
    root.closest('section').addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight') show(current + 1);
        if (e.key === 'ArrowLeft') show(current - 1);
    });

    // Pause while hovering or focusing inside the slider
    const pause = () => { root.classList.add('is-paused'); stop(); };
    const resume = () => { root.classList.remove('is-paused'); restart(); };
    root.addEventListener('mouseenter', pause);
    root.addEventListener('mouseleave', resume);
    root.addEventListener('focusin', pause);
    root.addEventListener('focusout', resume);

    // Pause when the tab is hidden
    document.addEventListener('visibilitychange', () => {
        document.hidden ? pause() : resume();
    });

    // Swipe on touch screens
    let startX = 0;
    root.addEventListener('touchstart', (e) => { startX = e.touches[0].clientX; }, { passive: true });
    root.addEventListener('touchend', (e) => {
        const dx = e.changedTouches[0].clientX - startX;
        if (Math.abs(dx) > 50) show(current + (dx < 0 ? 1 : -1));
    }, { passive: true });

    if (reduceMotion) root.classList.add('no-autoplay');
    show(0);
})();


export function initScrollOptimization() {
    let scrollTimeout;
    
    const scrollHandler = () => {
        document.body.classList.add('is-scrolling');
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            document.body.classList.remove('is-scrolling');
        }, 150);
    };

    window.addEventListener('scroll', scrollHandler, { passive: true });

    console.log("✅ Optimización de scroll inicializada");
}
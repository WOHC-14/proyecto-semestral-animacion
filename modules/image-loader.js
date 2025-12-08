export function initImageLoadHandler() {
    const images = document.querySelectorAll('.logo-marca img:not(.loaded), .auto-imagen:not(.loaded), .tsp-imagen:not(.loaded)');

    const imgObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                
                if (img.complete) {
                    img.classList.add('loaded');
                } else {
                    img.onload = () => img.classList.add('loaded');
                    img.onerror = () => {
                        console.warn('Error imagen:', img.src);
                        img.classList.add('loaded');
                    };
                }
                observer.unobserve(img);
            }
        });
    }, { rootMargin: "50px 0px" });

    images.forEach(img => imgObserver.observe(img));

    console.log('✅ Image Observer inicializado');
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initImageLoadHandler);
} else {
    initImageLoadHandler();
}

export default initImageLoadHandler;
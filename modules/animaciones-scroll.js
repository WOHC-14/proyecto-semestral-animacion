/**

@param {string} selector 
 @param {string} claseActiva 
 */

export function initScrollReveal(selector = '.animar-scroll', claseActiva = 'en-vista') {
    const elementos = document.querySelectorAll(selector);


    if (elementos.length === 0) return;
    
    if (!('IntersectionObserver' in window)) {
        elementos.forEach(el => el.classList.add(claseActiva));
        return;
    }

    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -10% 0px', 
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                
                el.classList.add(claseActiva);
                

                obs.unobserve(el);
            }
        });
    }, observerOptions);

    elementos.forEach((el, index) => {
        observer.observe(el);
    });
    
    console.log(`✨ Scroll Reveal inicializado para ${elementos.length} elementos.`);
}
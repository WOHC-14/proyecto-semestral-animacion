import { ParallaxHero } from './modules/parallax.js';
import { initModal } from './modules/modal.js';
import { initMenu } from './modules/menu.js';
import { initDarkMode } from './modules/darkmode.js';
import { initCarrusel } from './modules/carrusel.js';
import { initScrollOptimization } from './modules/scroll-optimization.js';
import { initImageLoadHandler } from './modules/image-loader.js';

console.log('🚀 Iniciando LuxTop Motors...');


initScrollOptimization();
initImageLoadHandler();
initMenu();
initDarkMode();
initModal();


if (document.querySelector('.seccion-hero')) {
    new ParallaxHero();
}

if (document.querySelector('.carrusel-marcas')) {
    initCarrusel();
}


const experienciaSection = document.querySelector(".seccion-experiencia");
if (experienciaSection) {
    const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
            observer.disconnect();
            
            const load3D = async () => {
                try {
                    const module = await import('./modules/visualizador3d.js');
                    new module.Visualizador3D();
                    console.log("✅ Visualizador 3D cargado bajo demanda");
                } catch (e) {
                    console.error("Error módulo 3D:", e);
                }
            };

            if ('requestIdleCallback' in window) {
                requestIdleCallback(() => load3D(), { timeout: 3000 });
            } else {
                setTimeout(load3D, 100);
            }
        }
    }, { rootMargin: "200px" });
    
    observer.observe(experienciaSection);
}
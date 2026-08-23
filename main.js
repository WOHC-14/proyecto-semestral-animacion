import '@fontsource/unbounded/300.css';
import '@fontsource/unbounded/400.css';
import '@fontsource/unbounded/600.css';
import '@fontsource/unbounded/800.css';
import '@fontsource/great-vibes/400.css';

import { injectIcons } from './modules/icons.js';
import { ParallaxHero } from './modules/parallax.js';
import { initModal } from './modules/modal.js';
import { initMenu } from './modules/menu.js';
import { initDarkMode } from './modules/darkmode.js';
import { initImageLoadHandler } from './modules/image-loader.js';
import { initCarruselMarcas } from './modules/carrusel-pasos.js';

console.log('🚀 Iniciando LuxTop Motors...');

injectIcons();
initImageLoadHandler();
initMenu();
initDarkMode();
initModal();

if (document.querySelector('.marquee-marcas')) {
    initCarruselMarcas();
}

if (document.querySelector('.seccion-hero')) {
    new ParallaxHero();
}

// El visor 3D (<model-viewer>) se define solo cuando la sección está por entrar
// en viewport: evita ~200 KB de JS en la carga inicial.
const experienciaSection = document.querySelector('.seccion-experiencia');
if (experienciaSection && !customElements.get('model-viewer')) {
    const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
            observer.disconnect();
            Promise.all([
                import('@google/model-viewer'),
                import('./modules/visor-modelviewer.js')
            ])
                .then(([, { initVisorModelViewer }]) => {
                    initVisorModelViewer();
                    console.log('✅ Visor 3D cargado bajo demanda');
                })
                .catch((e) => console.error('Error módulo 3D:', e));
        }
    }, { rootMargin: '300px' });
    observer.observe(experienciaSection);
}

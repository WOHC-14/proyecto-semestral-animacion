// Controla las vistas de cámara del <model-viewer> de la sección
// "Experiencia Interactiva". model-viewer interpola suavemente hacia el
// nuevo orbit/target al asignar las propiedades.
const VISTAS = {
    'vista-general': { orbit: '90deg 76deg auto', target: 'auto auto auto' },
    'interior': { orbit: '55deg 62deg auto', target: '0m 1.1m 0.3m' },
    'aerodinamica': { orbit: '-125deg 58deg auto', target: 'auto 0.9m -0.5m' }
};

export function initVisorModelViewer() {
    const visor = document.getElementById('visorModelo');
    if (!visor || !customElements.get('model-viewer')) return;

    const descripcionEl = document.getElementById('modelo-descripcion-dinamica');
    const botones = document.querySelectorAll('.feature-btn');

    const activarVista = (key) => {
        const vista = VISTAS[key];
        if (!vista) return;
        visor.cameraOrbit = vista.orbit;
        visor.cameraTarget = vista.target;
    };

    botones.forEach((btn) => {
        btn.addEventListener('click', () => {
            botones.forEach((b) => b.classList.remove('active'));
            btn.classList.add('active');

            const key = btn.dataset.target;
            activarVista(key);

            if (descripcionEl) {
                const texto = btn.dataset.descripcion;
                if (texto) descripcionEl.textContent = texto;
            }
        });
    });

    // Al terminar la carga inicial, aplica la vista general por defecto.
    visor.addEventListener('load', () => activarVista('vista-general'), { once: true });
}

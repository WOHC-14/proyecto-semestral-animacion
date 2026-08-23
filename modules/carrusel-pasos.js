// Carrusel por pasos que replica el comportamiento del antiguo Swiper:
// - Un paso cada 2000 ms con transición de 1200 ms (autoplay delay/speed).
// - reverseDirection: el índice activo retrocede y la pista se desplaza a la derecha.
// - Slide centrado ampliado y a color (is-center); adyacentes intermedios (is-prev/is-next).
// - pauseOnMouseEnter, pausa con pestaña oculta o sección fuera de pantalla.
// - Loop infinito sin salto visible gracias a las dos copias del grupo de logos.
const INTERVALO_PASO = 2000;
const DURACION_TRANSICION = 1200;
const VECINOS_VISIBLES = 3;

export function initCarruselMarcas() {
    const carrusel = document.querySelector('.marquee-marcas');
    const pista = carrusel?.querySelector('.pista-marquee');
    if (!carrusel || !pista) return null;

    const items = Array.from(pista.querySelectorAll(':scope > .grupo-logos > .logo-item'));
    const total = items.length / 2;
    if (!total || !Number.isInteger(total)) return null;

    const reducirMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let indice = total;
    let temporizador = null;
    let pausaHover = false;
    let enPantalla = true;
    let transicionando = false;

    carrusel.classList.remove('sin-js');

    const anchoPaso = () => {
        const primero = items[0].getBoundingClientRect();
        const siguiente = items[1]?.getBoundingClientRect();
        return (siguiente ? siguiente.left - primero.left : 0) || 1;
    };

    const posicionar = (animado) => {
        const anchoItem = items[0].getBoundingClientRect().width || 1;
        const objetivo = carrusel.clientWidth / 2 - anchoItem / 2 - indice * anchoPaso();
        pista.style.transition = animado
            ? `transform ${DURACION_TRANSICION}ms cubic-bezier(0.4, 0.0, 0.2, 1)`
            : 'none';
        pista.style.transform = `translate3d(${objetivo}px, 0, 0)`;
    };

    const marcarActivos = () => {
        const activo = ((indice % total) + total) % total;
        items.forEach((item, i) => {
            const logico = i % total;
            item.classList.toggle('is-center', logico === activo);
            item.classList.toggle('is-prev', logico === (activo - 1 + total) % total);
            item.classList.toggle('is-next', logico === (activo + 1) % total);
        });
    };

    const puedeAvanzar = () => !pausaHover && enPantalla && !document.hidden;

    const programarSiguiente = () => {
        clearTimeout(temporizador);
        temporizador = window.setTimeout(paso, INTERVALO_PASO);
    };

    const detener = () => clearTimeout(temporizador);

    const reanudar = () => {
        if (reducirMovimiento) return;
        if (!transicionando && puedeAvanzar()) programarSiguiente();
    };

    const paso = () => {
        if (!puedeAvanzar()) return;
        transicionando = true;
        indice -= 1; // reverseDirection: la pista se mueve hacia la derecha
        marcarActivos();
        posicionar(!reducirMovimiento);
        window.setTimeout(() => {
            transicionando = false;
            // Salto invisible entre copias idénticas cuando quedan pocos
            // vecinos a la izquierda para cubrir el ancho visible.
            if (indice <= VECINOS_VISIBLES) {
                indice += total;
                posicionar(false);
            }
            if (puedeAvanzar()) programarSiguiente();
        }, reducirMovimiento ? 0 : DURACION_TRANSICION);
    };

    const alEntrarCursor = () => { pausaHover = true; detener(); };
    const alSalirCursor = () => { pausaHover = false; reanudar(); };
    const alCambiarVisibilidad = () => {
        if (document.hidden || !puedeAvanzar()) detener();
        else reanudar();
    };
    let redimensionTemporizador = null;
    const alRedimensionar = () => {
        clearTimeout(redimensionTemporizador);
        redimensionTemporizador = window.setTimeout(() => posicionar(false), 150);
    };

    posicionar(false);
    marcarActivos();

    if (!reducirMovimiento && puedeAvanzar()) programarSiguiente();

    carrusel.addEventListener('mouseenter', alEntrarCursor);
    carrusel.addEventListener('mouseleave', alSalirCursor);
    document.addEventListener('visibilitychange', alCambiarVisibilidad);
    window.addEventListener('resize', alRedimensionar);

    const observadorSeccion = new IntersectionObserver((entries) => {
        enPantalla = entries[0].isIntersecting;
        if (enPantalla) reanudar();
        else detener();
    }, { threshold: 0.15 });
    observadorSeccion.observe(carrusel);

    return () => {
        detener();
        observadorSeccion.disconnect();
        carrusel.removeEventListener('mouseenter', alEntrarCursor);
        carrusel.removeEventListener('mouseleave', alSalirCursor);
        document.removeEventListener('visibilitychange', alCambiarVisibilidad);
        window.removeEventListener('resize', alRedimensionar);
    };
}

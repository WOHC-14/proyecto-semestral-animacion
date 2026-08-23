// Utilidades para <picture> responsivo basado en el manifiesto generado por
// scripts/optimize-images.mjs (public/img/opt/manifest.json).
let manifiesto = null;
let peticion = null;

export function cargarManifiesto() {
    if (manifiesto) return Promise.resolve(manifiesto);
    if (!peticion) {
        peticion = fetch('img/opt/manifest.json')
            .then((r) => (r.ok ? r.json() : {}))
            .then((data) => {
                manifiesto = data;
                return manifiesto;
            })
            .catch(() => {
                manifiesto = {};
                return manifiesto;
            });
    }
    return peticion;
}

function anchosDe(rutaOriginal) {
    return (manifiesto && manifiesto[rutaOriginal]) || [];
}

function rutaVariante(rutaOriginal, ancho, extension) {
    const sinExtension = rutaOriginal.replace(/\.\w+$/, '');
    const nombre = sinExtension.split('/').pop();
    return `img/opt/${nombre}-${ancho}.${extension}`;
}

function srcsetPara(rutaOriginal, extension) {
    return anchosDe(rutaOriginal)
        .map((w) => `${rutaVariante(rutaOriginal, w, extension)} ${w}w`)
        .join(', ');
}

/**
 * Genera el HTML de un <picture> con variantes AVIF/WebP.
 * Si la imagen no tiene variantes en el manifiesto, degradará a <img> simple.
 */
export function pictureHTML({
    ruta,
    alt,
    clase = '',
    sizes = '(max-width: 600px) 100vw, 33vw',
    eager = false,
    width,
    height,
    extraAttrs = ''
}) {
    const avif = srcsetPara(ruta, 'avif');
    const webp = srcsetPara(ruta, 'webp');

    const attrs = [
        `src="${ruta}"`,
        `alt="${alt}"`,
        clase ? `class="${clase}"` : '',
        eager ? 'loading="eager"' : 'loading="lazy"',
        'decoding="async"',
        width ? `width="${width}"` : '',
        height ? `height="${height}"` : '',
        extraAttrs
    ]
        .filter(Boolean)
        .join(' ');

    if (!avif || !webp) {
        return `<img ${attrs}>`;
    }

    return `
        <picture>
            <source type="image/avif" srcset="${avif}" sizes="${sizes}">
            <source type="image/webp" srcset="${webp}" sizes="${sizes}">
            <img ${attrs}>
        </picture>`;
}

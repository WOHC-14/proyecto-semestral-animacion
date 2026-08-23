// Genera variantes AVIF + WebP responsivas para todo el catálogo.
// Salida: public/img/opt/<nombre>-<ancho>.<avif|webp>
// Los originales en public/img/ y public/img/coleccion/ quedan intactos
// como fallback. Idempotente: omite archivos ya generados.
import sharp from 'sharp';
import { readdir, stat, mkdir, writeFile } from 'node:fs/promises';
import { join, basename, extname } from 'node:path';

const ANCHOS = [400, 800, 1200, 1600];
const ORIGENES = ['public/img', 'public/img/coleccion'];
const DESTINO = 'public/img/opt';

const esImagen = (f) => /\.(jpe?g|png|webp)$/i.test(f);

async function listarImagenes(dir) {
    const out = [];
    for (const entrada of await readdir(dir, { withFileTypes: true })) {
        const ruta = join(dir, entrada.name);
        if (entrada.isDirectory()) {
            if (ruta === DESTINO) continue;
            out.push(...(await listarImagenes(ruta)));
        } else if (esImagen(entrada.name)) {
            out.push(ruta);
        }
    }
    return out;
}

async function existe(p) {
    try {
        await stat(p);
        return true;
    } catch {
        return false;
    }
}

let generados = 0;
let omitidos = 0;

await mkdir(DESTINO, { recursive: true });

// rutaOriginal -> anchos disponibles (para construir srcset exactos)
const manifiesto = {};

for (const origen of ORIGENES) {
    const imagenes = await listarImagenes(origen);
    console.log(`📸 ${origen}: ${imagenes.length} imágenes`);

    for (const img of imagenes) {
        const nombre = basename(img, extname(img));
        const meta = await sharp(img).metadata();

        const rutaPublica = img.replace(/^public\//, '');
        const anchosDisponibles = ANCHOS.filter((a) => a <= meta.width);
        manifiesto[rutaPublica] = anchosDisponibles;

        for (const ancho of anchosDisponibles) {

            const resize = sharp(img).resize({ width: ancho, withoutEnlargement: true });

            for (const formato of ['avif', 'webp']) {
                const destino = join(
                    DESTINO,
                    `${nombre}-${ancho}.${formato}`
                );
                if (await existe(destino)) {
                    omitidos++;
                    continue;
                }
                if (formato === 'avif') {
                    await resize.clone().avif({ quality: 50, effort: 2 }).toFile(destino);
                } else {
                    await resize.clone().webp({ quality: 72 }).toFile(destino);
                }
                generados++;
            }
        }
    }
}

console.log(`✅ ${generados} variantes creadas, ${omitidos} ya existían.`);

await writeFile(
    join(DESTINO, 'manifest.json'),
    JSON.stringify(manifiesto, null, 1)
);
console.log(`📜 manifest.json actualizado (${Object.keys(manifiesto).length} imágenes).`);

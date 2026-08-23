// Reempaqueta el GLB del Porsche: elimina EXT_meshopt_compression (incompatible
// con el clonado de escena de @google/model-viewer) y aplica compresión Draco,
// soportada nativamente por <model-viewer>.
// Uso: node scripts/convert-model.mjs <entrada.glb> [salida.glb]
import { NodeIO } from '@gltf-transform/core';
import {
    EXTMeshoptCompression,
    EXTTextureWebP,
    KHRMeshQuantization,
    KHRMaterialsClearcoat,
    KHRMaterialsSpecular,
    KHRDracoMeshCompression
} from '@gltf-transform/extensions';
import { MeshoptDecoder } from 'meshoptimizer';
import draco3d from 'draco3dgltf';
import { draco } from '@gltf-transform/functions';

const entrada = process.argv[2] ?? 'public/models/porsche_optimized.glb';
const salida = process.argv[3] ?? entrada;

const ioLectura = new NodeIO()
    .registerExtensions([
        EXTMeshoptCompression,
        EXTTextureWebP,
        KHRMeshQuantization,
        KHRMaterialsClearcoat,
        KHRMaterialsSpecular
    ])
    .registerDependencies({ 'meshopt.decoder': MeshoptDecoder });

const doc = await ioLectura.read(entrada);
console.log('Extensiones de entrada:', doc.getRoot().listExtensionsUsed().map((e) => e.extensionName));

// Aplica compresión Draco a las mallas (reemplaza a meshopt).
await doc.transform(draco());

const ioEscritura = new NodeIO()
    .registerExtensions([EXTTextureWebP, KHRMeshQuantization, KHRMaterialsClearcoat, KHRMaterialsSpecular, KHRDracoMeshCompression])
    .registerDependencies({
        'draco3d.encoder': await draco3d.createEncoderModule(),
        'draco3d.decoder': await draco3d.createDecoderModule()
    });

await ioEscritura.write(salida, doc);

const { statSync } = await import('node:fs');
console.log(`✅ ${salida}: ${(statSync(salida).size / 1024).toFixed(0)} KB`);

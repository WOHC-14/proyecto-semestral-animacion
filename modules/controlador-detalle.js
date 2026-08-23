
import { cargarManifiesto, pictureHTML } from './img-responsiva.js';

const contenedorPrincipal = document.querySelector('.visor-principal');

function montarImagenPrincipal(ruta, alt) {
    if (!contenedorPrincipal) return;
    contenedorPrincipal.innerHTML = pictureHTML({
        ruta,
        alt,
        clase: 'visor-img-grande',
        sizes: '(max-width: 900px) 100vw, 60vw',
        eager: true,
        extraAttrs: 'id="imgPrincipal" loading="eager"'
    });
}

function cambiarImagen(elemento, nuevaSrc, alt = 'Vista del vehículo') {
    const imgPrincipal = document.getElementById('imgPrincipal');
    const todosThumbs = document.querySelectorAll('.thumb-btn');


    if (imgPrincipal) {
        imgPrincipal.style.opacity = '0.6';
        setTimeout(() => {
            montarImagenPrincipal(nuevaSrc, alt);
            const nuevaImg = document.getElementById('imgPrincipal');
            if (nuevaImg) {
                nuevaImg.style.opacity = '1';
                nuevaImg.classList.add('loaded');
            }
        }, 200);
    }


    todosThumbs.forEach(thumb => thumb.classList.remove('activo'));
    elemento.classList.add('activo');
}


window.cambiarImagen = cambiarImagen;

document.addEventListener('DOMContentLoaded', async () => {

    const params = new URLSearchParams(window.location.search);
    const autoId = params.get('id');
    
    const modeloAutoTitle = document.getElementById('modeloAuto');


    if (!autoId) {
        modeloAutoTitle.textContent = "Vehículo no especificado";
        console.error("❌ Error: No se proporcionó ID de vehículo en la URL");
        return;
    }

    try {

        await cargarManifiesto();

        const response = await fetch('./autos.json');
        
        if (!response.ok) {
            throw new Error(`Error al cargar autos.json: ${response.status}`);
        }
        
        const autos = await response.json();
        

        const auto = autos.find(a => a.id === autoId);


        if (!auto) {
            modeloAutoTitle.textContent = "Vehículo no encontrado";
            console.error(`❌ Error: No se encontró vehículo con ID "${autoId}"`);
            

            const mainContent = document.querySelector('main');
            if (mainContent) {
                mainContent.innerHTML = `
                    <div style="text-align: center; padding: 100px 20px;">
                        <h2 style="font-family: 'Unbounded', sans-serif; color: var(--lux-primary); margin-bottom: 20px;">
                            Vehículo No Encontrado
                        </h2>
                        <p style="color: var(--lux-text-light); margin-bottom: 30px;">
                            El vehículo solicitado no se encuentra en nuestro inventario.
                        </p>
                        <a href="coleccion.html" class="boton-principal">
                            Ver Colección Completa
                        </a>
                    </div>
                `;
            }
            return;
        }
        
        console.log("✅ Vehículo cargado:", auto.marca, auto.modelo);


        document.getElementById('marcaAuto').textContent = auto.marca;
        modeloAutoTitle.textContent = auto.modelo;
        document.getElementById('precioAuto').textContent = `$${auto.precio.toLocaleString('en-US')}`;
        

        document.getElementById('specPotencia').textContent = auto.potencia;
        document.getElementById('specAceleracion').textContent = auto.aceleracion;
        document.getElementById('specYear').textContent = auto.year;


        const columnaInfo = document.querySelector('.columna-info');
        if (columnaInfo) {

            const primeraLetra = auto.descripcion_corta.charAt(0);
            const restoTexto = auto.descripcion_corta.slice(1);

            let seccionesHTML = '';
            if (auto.secciones_destacadas && auto.secciones_destacadas.length > 0) {
                seccionesHTML = auto.secciones_destacadas.map(seccion => `
                    <h2>${seccion.titulo}</h2>
                    <p>${seccion.contenido}</p>
                `).join('');
            }
            
            columnaInfo.innerHTML = `
                <div class="texto-descripcion">
                    <p class="dropcap">${primeraLetra}</p>
                    <p>${restoTexto}</p>
                    
                    ${seccionesHTML}
                </div>
            `;
        }


        const datosTecnicos = [
            { label: 'Motor', value: auto.motor },
            { label: 'Transmisión', value: auto.transmision },
            { label: 'Tracción', value: auto.traccion },
            { label: 'Kilometraje', value: auto.kilometraje },
            { label: 'Color Exterior', value: auto.color_ext },
            { label: 'Color Interior', value: auto.color_int },
            { label: 'Garantía', value: 'Oficial hasta 2026' }
        ];

        const listaDatos = document.getElementById('listaDatosTecnicos');
        if (listaDatos) {
            listaDatos.innerHTML = datosTecnicos
                .map(d => `<li><span>${d.label}</span> <span>${d.value}</span></li>`)
                .join('');
        }

       

        const containerThumbs = document.querySelector('.tira-miniaturas');
        
        if (containerThumbs) {
            containerThumbs.innerHTML = ''; 
        }

        if (auto.imagenes && auto.imagenes.length > 0) {

            montarImagenPrincipal(auto.imagenes[0], `${auto.marca} Vista Principal`);
            const imgPrincipal = document.getElementById('imgPrincipal');
            if (imgPrincipal) {
                imgPrincipal.addEventListener('load', () => imgPrincipal.classList.add('loaded'), { once: true });
            }


            const vistas = ['Vista Frontal', 'Vista Interior', 'Vista Trasera', 'Detalle Rines'];
            
            auto.imagenes.forEach((src, index) => {
                const btn = document.createElement('button');
                btn.className = `thumb-btn ${index === 0 ? 'activo' : ''}`;
                btn.onclick = function() { window.cambiarImagen(this, src, `${auto.marca} ${vistas[index] || `Vista ${index + 1}`}`); };
                
                const span = document.createElement('span');
                span.innerHTML = pictureHTML({
                    ruta: src,
                    alt: vistas[index] || `Vista ${index + 1}`,
                    sizes: '(max-width: 600px) 22vw, 120px',
                    eager: index === 0
                });
                const img = span.querySelector('img');
                
                btn.appendChild(img);
                if (containerThumbs) {
                    containerThumbs.appendChild(btn);
                }
            });
        } else {
            montarImagenPrincipal('img/porsche-911-gt3-1.webp', 'Imagen no disponible');
            console.warn("⚠️ Advertencia: No se encontraron imágenes para este vehículo");
        }

        const visorContainer = document.querySelector('.contenedor-visor');
        if (visorContainer) {
            visorContainer.style.opacity = '1';
        }

        console.log("✅ Página de detalle cargada exitosamente");

    } catch (error) {
        console.error("❌ Error cargando datos del vehículo:", error);

        const modeloAutoTitle = document.getElementById('modeloAuto');
        if (modeloAutoTitle) {
            modeloAutoTitle.textContent = "Error al cargar información";
        }
        
        console.error("Detalles del error:", {
            mensaje: error.message,
            stack: error.stack
        });
    }
});
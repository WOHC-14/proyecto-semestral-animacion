

document.addEventListener('DOMContentLoaded', async () => {
    const grid = document.getElementById('gridInventario');
    const btnControl = document.getElementById('btnCargarMas');
    const contenedorBtn = document.querySelector('.contenedor-cargar-mas');
    const filterBtns = document.querySelectorAll('.filtro-btn');
    const inputBuscador = document.getElementById('inputBuscador');
    const mensajeVacio = document.getElementById('mensajeSinResultados');
    

    const ITEMS_INICIALES = 9;
    const ITEMS_LOTE = 6;
    

    let estado = {
        filtro: 'all',
        busqueda: '',
        mostrados: ITEMS_INICIALES
    };

    let inventarioCompleto = [];
    let inventarioProcesado = []; 


    mostrarSkeletonCards(ITEMS_INICIALES);

    try {
        const response = await fetch('autos.json');
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        inventarioCompleto = await response.json();

        const estadoGuardado = recuperarEstado();
        if (estadoGuardado) {
            estado = estadoGuardado;

            inputBuscador.value = estado.busqueda;
            actualizarBotonesFiltroUI();
        }

        actualizarInventarioProcesado();
        calcularContadores(); 
        
        await renderizarGrid();

    } catch (error) {
        console.error("❌ Error crítico:", error);
        mostrarError();
    }

    
    function actualizarInventarioProcesado() {
        const termino = estado.busqueda.toLowerCase().trim();
        
        inventarioProcesado = inventarioCompleto.filter(auto => {
            const pasaCategoria = estado.filtro === 'all' || auto.categoria === estado.filtro;
            
            const pasaBusqueda = termino === '' || 
                                 auto.marca.toLowerCase().includes(termino) || 
                                 auto.modelo.toLowerCase().includes(termino);
            
            return pasaCategoria && pasaBusqueda;
        });
    }

    function calcularContadores() {
        const conteos = {
            'all': inventarioCompleto.length,
            'superdeportivo': 0,
            'gt': 0,
            'suv': 0
        };

        inventarioCompleto.forEach(auto => {
            if (conteos[auto.categoria] !== undefined) {
                conteos[auto.categoria]++;
            }
        });

        filterBtns.forEach(btn => {
            const cat = btn.getAttribute('data-filter');
            const badge = btn.querySelector('.count-badge');
            if (badge && conteos[cat] !== undefined) {
                badge.textContent = `(${conteos[cat]})`;
            }
        });
    }

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            if (btn.classList.contains('activo')) return;

            filterBtns.forEach(b => b.classList.remove('activo'));
            btn.classList.add('activo');

            estado.filtro = btn.getAttribute('data-filter');
            estado.mostrados = ITEMS_INICIALES;

            actualizarInventarioProcesado();
            renderizarGrid(true); 
        });
    });


    let debounceTimer;
    inputBuscador.addEventListener('input', (e) => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            estado.busqueda = e.target.value;
            estado.mostrados = ITEMS_INICIALES; 
            
            actualizarInventarioProcesado();
            renderizarGrid(true);
        }, 300); 
    });


    btnControl.addEventListener('click', () => {
        const accion = btnControl.getAttribute('data-action');
        
        if (accion === 'expandir') {
            estado.mostrados += ITEMS_LOTE;
        } else {
            estado.mostrados = ITEMS_INICIALES;

            const headerOffset = 150;
            const elementPosition = grid.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
            window.scrollTo({ top: offsetPosition, behavior: "smooth" });
        }
        
        renderizarGrid(false);
    });

    
    async function renderizarGrid(limpiarGrid = false) {
        if (inventarioProcesado.length === 0) {
            grid.innerHTML = '';
            grid.style.display = 'none';
            mensajeVacio.style.display = 'block';
            contenedorBtn.style.display = 'none';
            return;
        } else {
            grid.style.display = 'grid';
            mensajeVacio.style.display = 'none';
        }

        const itemsVisibles = inventarioProcesado.slice(0, estado.mostrados);

        if (limpiarGrid) {
            grid.innerHTML = '';
        }


        const cardsExistentes = grid.querySelectorAll('.card-vehiculo');
        const cantidadActual = cardsExistentes.length;
        

        const skeletons = grid.querySelectorAll('.card-skeleton');
        skeletons.forEach(s => s.remove());

        if (itemsVisibles.length < cantidadActual) {
            grid.innerHTML = '';

        }

        const fragment = document.createDocumentFragment();
        let nuevosItemsCount = 0;

        itemsVisibles.forEach((auto, index) => {

            if (index < grid.children.length) return;

            const card = crearCard(auto, index);
            fragment.appendChild(card);
            nuevosItemsCount++;
        });

        if (nuevosItemsCount > 0) {
            grid.appendChild(fragment);

            requestAnimationFrame(() => {
                const nuevasCards = grid.querySelectorAll('.card-vehiculo[style*="opacity: 0"]');
                nuevasCards.forEach((card, i) => {
                    setTimeout(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0)';
                    }, i * 50); 
                });
            });
        }

        actualizarBotonControl();
        guardarEstadoEnMemoria();
    }

    function crearCard(auto, index) {
        const article = document.createElement('article');
        article.className = 'card-vehiculo';
        article.style.opacity = '0';
        article.style.transform = 'translateY(20px)';
        article.style.transition = 'opacity 0.4s ease, transform 0.4s ease';

        const loadingType = index < 6 ? 'eager' : 'lazy';
        
        article.innerHTML = `
            <a href="auto-detalles.html?id=${auto.id}" class="card-img-wrapper js-guardar-estado">
                <img src="${auto.imagenes[0]}" 
                     alt="${auto.marca} ${auto.modelo}" 
                     loading="${loadingType}"
                     decoding="async"
                     width="800"
                     height="600"
                     sizes="(max-width: 600px) 100vw, (max-width: 900px) 50vw, 33vw"
                     onload="this.classList.add('loaded')">
                <div class="card-overlay-hover">
                    <span class="btn-ver-pieza">Ver Detalles</span>
                </div>
            </a>
            
            <div class="card-info">
                <div class="card-header-info">
                    <span class="card-make">${auto.marca}</span>
                    <span class="card-year">${auto.year}</span>
                </div>
                <h3 class="card-modelo">
                    <a href="auto-detalles.html?id=${auto.id}" class="js-guardar-estado">${auto.modelo}</a>
                </h3>
                <div class="card-specs">
                    <span>${auto.motor.split(' ')[0]}</span>
                    <span class="separador-dot">•</span>
                    <span>${auto.potencia}</span>
                    <span class="separador-dot">•</span>
                    <span>${auto.aceleracion}</span>
                </div>
                <div class="card-footer-info">
                    <p class="card-precio">$${auto.precio.toLocaleString()}</p>
                    <a href="auto-detalles.html?id=${auto.id}" class="link-detalle js-guardar-estado">
                        Ver Detalles <i class="fas fa-arrow-right"></i>
                    </a>
                </div>
            </div>
        `;

        article.querySelectorAll('.js-guardar-estado').forEach(el => {
            el.addEventListener('click', guardarEstadoEnMemoria);
        });

        return article;
    }


    function actualizarBotonControl() {
        const total = inventarioProcesado.length;

        if (total <= ITEMS_INICIALES) {
            contenedorBtn.style.display = 'none';
        } else {
            contenedorBtn.style.display = 'block';
            
            if (estado.mostrados >= total) {
                btnControl.textContent = "Ver Menos";
                btnControl.setAttribute('data-action', 'colapsar');
            } else {
                const restantes = total - estado.mostrados;
                btnControl.textContent = `Cargar Más (${restantes})`;
                btnControl.setAttribute('data-action', 'expandir');
            }
        }
    }

    function actualizarBotonesFiltroUI() {
        filterBtns.forEach(b => {
            if(b.getAttribute('data-filter') === estado.filtro) {
                b.classList.add('activo');
            } else {
                b.classList.remove('activo');
            }
        });
    }

    function mostrarSkeletonCards(cantidad) {
        const fragment = document.createDocumentFragment();
        for (let i = 0; i < cantidad; i++) {
            const div = document.createElement('div');
            div.className = 'card-vehiculo card-skeleton';
            div.innerHTML = `
                <div class="skeleton-img"></div>
                <div class="skeleton-info">
                    <div class="skeleton-line skeleton-header"></div>
                    <div class="skeleton-line skeleton-title"></div>
                    <div class="skeleton-line skeleton-specs"></div>
                </div>`;
            fragment.appendChild(div);
        }
        grid.appendChild(fragment);
    }

    function mostrarError() {
        grid.innerHTML = `<h3 style="text-align:center; grid-column:1/-1">Error al cargar inventario</h3>`;
    }

    function guardarEstadoEnMemoria() {
        sessionStorage.setItem('luxColeccionEstado', JSON.stringify(estado));
    }

    function recuperarEstado() {
        const memoria = sessionStorage.getItem('luxColeccionEstado');
        return memoria ? JSON.parse(memoria) : null;
    }
});
let isModalInjected = false;
let modal = null;
let form = null;
let closeBtn = null;

function injectModalHTML() {
    if (isModalInjected) return;

    const modalHTML = `
        <div class="modal-superposicion" id="modalAgendarSuperposicion" aria-hidden="true">
            <div class="modal-contenedor" id="modalAgendar" role="dialog" aria-modal="true" aria-labelledby="modalTitulo">
                <button class="modal-boton-cerrar" id="modalCerrar" aria-label="Cerrar modal">&times;</button>
                <div class="modal-contenido">
                    <h2 class="modal-titulo" id="modalTitulo">Solicitar Información</h2>
                    <p class="modal-descripcion">Complete el formulario y nos pondremos en contacto con usted a la brevedad.</p>
                    <form id="formAgendarCita" class="modal-form">
                        <div class="form-grupo">
                            <label for="modalNombre">Nombre Completo</label>
                            <input type="text" id="modalNombre" name="nombre" required>
                        </div>
                        <div class="form-grupo">
                            <label for="modalEmail">Correo Electrónico</label>
                            <input type="email" id="modalEmail" name="email" required>
                        </div>
                        <div class="form-grupo">
                            <label for="modalTelefono">Teléfono (Opcional)</label>
                            <input type="tel" id="modalTelefono" name="telefono">
                        </div>
                        <div class="form-grupo">
                            <label for="modalMensaje">Mensaje</label>
                            <textarea id="modalMensaje" name="mensaje" rows="4" required></textarea>
                        </div>
                        <button type="submit" class="boton-principal modal-boton-enviar">Enviar Solicitud</button>
                    </form>
                </div>
            </div>
        </div>`;

    document.body.insertAdjacentHTML("beforeend", modalHTML);
    isModalInjected = true;

    modal = document.getElementById("modalAgendarSuperposicion");
    closeBtn = document.getElementById("modalCerrar");
    form = document.getElementById("formAgendarCita");

    bindModalEvents();
}

function cerrarModal() {
    if (!modal) return;
    modal.classList.remove("mostrar");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("menu-abierto");
}

function bindModalEvents() {
    closeBtn.addEventListener("click", cerrarModal);
    
    modal.addEventListener("click", (e) => {
        if (e.target === modal) cerrarModal();
    });

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && modal && modal.classList.contains("mostrar")) {
            cerrarModal();
        }
    });

    form.addEventListener("submit", (e) => {
        e.preventDefault();
        form.innerHTML = '<p class="modal-descripcion" style="text-align:center; padding: 2rem;">¡Gracias! Hemos recibido su solicitud.<br>Nos pondremos en contacto pronto.</p>';
        setTimeout(cerrarModal, 3500);
    });
}

export function initModal() {
    document.body.addEventListener("click", (e) => {
        if (e.target.closest('.js-abrir-agendar')) {
            e.preventDefault();
            if (!isModalInjected) injectModalHTML();
            
            requestAnimationFrame(() => {
                modal.classList.add("mostrar");
                modal.setAttribute("aria-hidden", "false");
                document.body.classList.add("menu-abierto");
                const nombreInput = document.getElementById("modalNombre");
                if (nombreInput) nombreInput.focus();
            });
        }
    });
    console.log("✅ Modal Listener (Lazy Load) inicializado");
}


export function initMenu() {
    const menuBtn = document.getElementById("botonMenu");
    const nav = document.getElementById("navPrincipal");
    const closeMenuBtn = document.getElementById("botonCerrarMenu");
    const overlay = document.getElementById("superposicionMenu");
    const navList = document.getElementById("listaNav");

    if (!menuBtn || !nav || !closeMenuBtn || !overlay) {
        console.warn("Elementos del menú no encontrados");
        return;
    }

    const cerrarMenu = () => {
        nav.classList.remove("mostrar");
        overlay.classList.remove("mostrar");
        document.body.classList.remove("menu-abierto");
        menuBtn.setAttribute("aria-expanded", "false");
        menuBtn.setAttribute("aria-label", "Abrir menú");
    };

    const abrirMenu = () => {
        nav.classList.add("mostrar");
        overlay.classList.add("mostrar");
        document.body.classList.add("menu-abierto");
        menuBtn.setAttribute("aria-expanded", "true");
        menuBtn.setAttribute("aria-label", "Cerrar menú");
    };

    menuBtn.addEventListener("click", () => {
        if (menuBtn.getAttribute("aria-expanded") === "true") {
            cerrarMenu();
        } else {
            abrirMenu();
        }
    });


    closeMenuBtn.addEventListener("click", cerrarMenu);


    overlay.addEventListener("click", cerrarMenu);

   
    if (navList) {
        navList.addEventListener("click", (e) => {
            if (e.target.tagName === "A" && nav.classList.contains("mostrar")) {
                cerrarMenu();
            }
        });
    }

    console.log("✅ Menú inicializado");
}
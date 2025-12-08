

export function initDarkMode() {
    const darkModeBtn = document.getElementById("botonModoOscuro");
    if (!darkModeBtn) {
        console.warn("Botón de modo oscuro no encontrado");
        return;
    }

    const html = document.documentElement;
    const sunIcon = darkModeBtn.querySelector(".icono-sol");
    const moonIcon = darkModeBtn.querySelector(".icono-luna");

    const setTheme = (theme) => {
        if (theme === "dark") {
            html.classList.add("dark-mode");
            html.classList.remove("light-mode");
            darkModeBtn.setAttribute("aria-label", "Activar modo claro");
            if (sunIcon) sunIcon.style.display = "block";
            if (moonIcon) moonIcon.style.display = "none";
        } else {
            html.classList.remove("dark-mode");
            html.classList.add("light-mode");
            darkModeBtn.setAttribute("aria-label", "Activar modo oscuro");
            if (sunIcon) sunIcon.style.display = "none";
            if (moonIcon) moonIcon.style.display = "block";
        }
    };


    const currentTheme = html.classList.contains("dark-mode") ? "dark" : "light";
    setTheme(currentTheme);

    darkModeBtn.addEventListener("click", () => {
        const newTheme = html.classList.contains("dark-mode") ? "light" : "dark";
        localStorage.setItem("theme", newTheme);
        setTheme(newTheme);
    });

    console.log("✅ Modo oscuro inicializado");
}
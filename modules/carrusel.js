

export function initCarrusel() {

    if (typeof Swiper === 'undefined') {
        console.warn("Swiper no está cargado");
        return;
    }

    function updateSwiperClasses(swiper) {
        const slides = Array.from(swiper.slides);
        slides.forEach((slide) => slide.classList.remove("is-center", "is-prev", "is-next"));
        const activeIndex = swiper.activeIndex;
        const prevIndex = (activeIndex - 1 + slides.length) % slides.length;
        const nextIndex = (activeIndex + 1) % slides.length;
        slides[activeIndex]?.classList.add("is-center");
        slides[prevIndex]?.classList.add("is-prev");
        slides[nextIndex]?.classList.add("is-next");
    }

    new Swiper(".carrusel-marcas", {
        loop: true,
        centeredSlides: true,
        slidesPerView: 3,
        spaceBetween: 40,
        speed: 1200,
        allowTouchMove: false,
        autoplay: {
            delay: 2000,
            disableOnInteraction: false,
            pauseOnMouseEnter: true, 
            reverseDirection: true
        },
        breakpoints: {
            768: { slidesPerView: 5, spaceBetween: 60 },
            1024: { slidesPerView: 7, spaceBetween: 80 }
        },
        on: {
            init(swiper) { 
                updateSwiperClasses(swiper); 
            },
            slideChangeTransitionStart(swiper) { 
                updateSwiperClasses(swiper); 
            }
        }
    });

    console.log("✅ Carrusel inicializado");
}
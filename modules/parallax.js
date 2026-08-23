export class ParallaxHero {
    constructor() {
        this.heroSection = document.querySelector(".seccion-hero");
        this.heroImage = document.querySelector(".imagen-hero");
        
        const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const isMobileView = window.matchMedia("(max-width: 900px)").matches;
        
        if (!this.heroSection || !this.heroImage || isMobileView || prefersReducedMotion) {
            console.warn("Parallax deshabilitado (Móvil, configuración de usuario o elementos faltantes)");
            if (this.heroImage) this.heroImage.style.transform = 'none'; 
            return;
        }

        this.parallaxSpeed = 0.5;
        this.cachedHeroTop = 0;
        this.cachedHeroHeight = 0;
        this.rafId = null;
        this.isVisible = false;
        this.lastScrollY = 0;
        this.currentOffset = 0;
        this.targetOffset = 0;
        this.ease = 0.1;

        this.heroImage.style.willChange = "transform";
        this.heroImage.style.transition = "none";
        this.heroImage.style.transform = "translate3d(0, 0, 0)";
        
        this.init();
    }

    init() {
        this.updateDimensions();

        this.observer = new IntersectionObserver((entries) => {
            this.isVisible = entries[0].isIntersecting;
            if (!this.isVisible) {
                this.stopParallax();
            } else {
                this.animate();
            }
        }, { rootMargin: "100px" });
        
        this.observer.observe(this.heroSection);

        // Referencias bound estables para poder remover los listeners en destroy().
        this._boundOnScroll = this.onScroll.bind(this);
        this._boundOnResize = this.onResize.bind(this);
        window.addEventListener("scroll", this._boundOnScroll, { passive: true });
        window.addEventListener("resize", this._boundOnResize, { passive: true });
    }

    updateDimensions() {
        this.cachedHeroTop = this.heroSection.offsetTop;
        this.cachedHeroHeight = this.heroSection.offsetHeight;
    }

    onResize() {
        this.updateDimensions();
        this.calculateTargetOffset();
    }

    onScroll() {
        if (!this.isVisible) return;
        this.lastScrollY = window.scrollY;
        
        if (!this.rafId) {
            this.animate();
        }
    }

    calculateTargetOffset() {
        const scrollY = this.lastScrollY;
        const heroBottom = this.cachedHeroTop + this.cachedHeroHeight;
        
        if (scrollY <= heroBottom) {
            const scrolled = Math.max(0, scrollY - this.cachedHeroTop);
            const progress = Math.min(scrolled / this.cachedHeroHeight, 1);
            this.targetOffset = progress * this.cachedHeroHeight * this.parallaxSpeed;
        }
    }

    animate() {
        this.calculateTargetOffset();
        
        const delta = this.targetOffset - this.currentOffset;
        
        if (Math.abs(delta) > 0.1) {
            this.currentOffset += delta * this.ease;
            this.heroImage.style.transform = `translate3d(0, ${this.currentOffset}px, 0)`;
            this.rafId = requestAnimationFrame(() => this.animate());
        } else {
            this.currentOffset = this.targetOffset;
            this.heroImage.style.transform = `translate3d(0, ${this.currentOffset}px, 0)`;
            this.rafId = null;
        }
    }

    stopParallax() {
        if (this.rafId) {
            cancelAnimationFrame(this.rafId);
            this.rafId = null;
        }
    }

    destroy() {
        this.stopParallax();
        if (this.observer) this.observer.disconnect();
        if (this._boundOnScroll) window.removeEventListener("scroll", this._boundOnScroll);
        if (this._boundOnResize) window.removeEventListener("resize", this._boundOnResize);
        if (this.heroImage) {
            this.heroImage.style.willChange = 'auto';
            this.heroImage.style.transform = 'none';
        }
    }
}
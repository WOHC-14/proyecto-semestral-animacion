import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.132.2/build/three.module.js";
import { GLTFLoader } from "https://cdn.jsdelivr.net/npm/three@0.132.2/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.132.2/examples/jsm/controls/OrbitControls.js";
import { DRACOLoader } from "https://cdn.jsdelivr.net/npm/three@0.132.2/examples/jsm/loaders/DRACOLoader.js";
import { MeshoptDecoder } from "https://cdn.jsdelivr.net/npm/three@0.132.2/examples/jsm/libs/meshopt_decoder.module.js";

export class Visualizador3D {
    constructor() {
        this.container = document.getElementById("modelo3D");
        if (!this.container) {
            console.warn("Canvas #modelo3D no encontrado.");
            return;
        }


        this.createLoader();


        this.panX = 0;
        this.targetY = 0.75;
        this.modelCenterY = 0;
        

        this.isLoaded = false;
        this.isIntersecting = false; 
        this.isPageVisible = true;
        this.isAnimatingCamera = false;
        this.isAnimating = false; // evita agendar múltiples loops de RAF en paralelo

        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(45, this.container.clientWidth / this.container.clientHeight, 0.1, 100);
        

        this.renderer = new THREE.WebGLRenderer({
            canvas: this.container,
            antialias: window.devicePixelRatio < 2,
            alpha: true,
            powerPreference: "high-performance"
        });

        this.model = null;
        this.targetCameraPos = new THREE.Vector3();
        this.targetControlsTarget = new THREE.Vector3();

 
        this.cameraTargets = {};
        this.descriptions = {
            "vista-general": "Una obra maestra de la ingeniería. Gira el modelo o selecciona una característica para explorar.",
            "interior": "La cabina combina Alcantara, fibra de carbono y un diseño enfocado en la pista.",
            "aerodinamica": "El alerón trasero 'cuello de cisne' y el difusor masivo generan una carga aerodinámica de nivel de competición."
        };

        this.observers = [];
        
        this.setupScene();
        this.setupLights();
        this.setupControls();
        this.loadModel(); 
        this.setupEventListeners();
        this.setupIntersectionObserver();
        
        this.animate();
    }

    createLoader() {

        const style = document.createElement('style');
        style.textContent = `
            .contenedor-loader-3d {
                position: absolute; top: 0; left: 0; width: 100%; height: 100%;
                background: rgba(15, 23, 32, 0.7);
                backdrop-filter: blur(5px);
                display: flex; flex-direction: column; justify-content: center; align-items: center;
                z-index: 10; transition: opacity 0.5s ease; pointer-events: none;
            }
            .spinner {
                width: 40px; height: 40px;
                border: 3px solid rgba(212, 175, 55, 0.3);
                border-radius: 50%; border-top-color: #d4af37;
                animation: spin 1s ease-in-out infinite; margin-bottom: 15px;
            }
            .texto-cargando {
                font-family: "Unbounded", sans-serif; font-size: 10px; color: #d4af37;
                letter-spacing: 0.1em; text-transform: uppercase; animation: pulse 1.5s infinite;
            }
            @keyframes spin { to { transform: rotate(360deg); } }
            @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
            .ocultar-loader { opacity: 0; visibility: hidden; }
        `;
        document.head.appendChild(style);

        const loaderHTML = `
            <div id="loader-3d-overlay" class="contenedor-loader-3d">
                <div class="spinner"></div>
                <div class="texto-cargando">Cargando Experiencia</div>
            </div>
        `;
        this.container.parentElement.insertAdjacentHTML('beforeend', loaderHTML);
        this.loaderElement = document.getElementById('loader-3d-overlay');
    }

    setupScene() {
        this.updateRendererSize();
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.0;
        this.renderer.shadowMap.enabled = false; 
        

        this.camera.position.set(3.8, 1.3, 0);
        this.camera.lookAt(this.panX, this.targetY, 0);
        this.scene.background = null;
    }

    setupLights() {
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);

        const mainLight = new THREE.DirectionalLight(0xffffff, 1.5);
        mainLight.position.set(3, 5, 3);
        this.scene.add(mainLight);

        const fillLight = new THREE.DirectionalLight(0xffffff, 0.8);
        fillLight.position.set(-2, 1, -1);
        this.scene.add(fillLight);
        
        const backLight = new THREE.DirectionalLight(0xffffff, 0.5);
        backLight.position.set(0, 2, -5);
        this.scene.add(backLight);
    }

    setupControls() {
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.screenSpacePanning = false;
        

        this.controls.minDistance = 2.5;
        this.controls.maxDistance = 6;
        this.controls.maxPolarAngle = Math.PI / 2.05;
        this.controls.minPolarAngle = 0.1;
        this.controls.target.set(this.panX, this.targetY, 0);
        

        this.controls.addEventListener('start', () => {

            this.isAnimatingCamera = false;
        });
    }

    loadModel() {
        const loader = new GLTFLoader();
        
        const dracoLoader = new DRACOLoader();
        dracoLoader.setDecoderPath('https://cdn.jsdelivr.net/npm/three@0.132.2/examples/jsm/libs/draco/gltf/');
        loader.setDRACOLoader(dracoLoader);
        loader.setMeshoptDecoder(MeshoptDecoder);

        loader.setPath("models/");
        loader.load(
            "porsche_optimized.glb", 
            (gltf) => {
                this.model = gltf.scene;
                
                const box = new THREE.Box3().setFromObject(this.model);
                const size = box.getSize(new THREE.Vector3());
                const scale = 4 / Math.max(size.x, size.y, size.z);
                this.modelCenterY = (size.y * scale) / 2;
                
                const center = box.getCenter(new THREE.Vector3());
                this.model.position.sub(center).multiplyScalar(scale);
                this.model.position.y += this.modelCenterY;
                this.model.scale.set(scale, scale, scale);
                
                this.model.traverse((node) => {
                    if (node.isMesh) {
                        node.castShadow = false;
                        node.receiveShadow = false;
                        node.updateMatrix(); 
                        node.matrixAutoUpdate = false;
                    }
                });

                this.scene.add(this.model);


                this.cameraTargets = {
                    "vista-general": {
                        pos: new THREE.Vector3(3.8, 0, 0),
                        target: new THREE.Vector3(this.panX, this.modelCenterY, 0)
                    },
                    "interior": {
                        pos: new THREE.Vector3(1.5, 1.2, 0.8),
                        target: new THREE.Vector3(0.3 + this.panX, this.modelCenterY - 0.1, 0)
                    },
                    "aerodinamica": {
                        pos: new THREE.Vector3(-2, 1.8, -2.8),
                        target: new THREE.Vector3(this.panX, this.modelCenterY, -1)
                    }
                };


                const startPos = this.cameraTargets["vista-general"];
                this.targetCameraPos.copy(startPos.pos);
                this.targetControlsTarget.copy(startPos.target);
                
                this.camera.position.copy(startPos.pos);
                this.controls.target.copy(startPos.target);
                this.controls.update();

                dracoLoader.dispose();
                this.isLoaded = true;
                

                if (this.loaderElement) {
                    this.loaderElement.classList.add('ocultar-loader');
                    setTimeout(() => this.loaderElement.remove(), 600);
                }


                this.renderer.render(this.scene, this.camera);

                // FIX: el/los intentos anteriores de animate() (constructor e
                // IntersectionObserver) salieron por el guard porque isLoaded
                // aún era false. Ahora que el modelo ya cargó, hay que
                // reanudar el loop explícitamente o se queda congelado.
                this.resumeLoopIfNeeded();
            },
            undefined,
            (error) => {
                console.error("Error:", error);
                if (this.loaderElement) this.loaderElement.innerHTML = "Error al cargar";
            }
        );
    }

    setupEventListeners() {
        this.resizeObserver = new ResizeObserver(() => this.updateRendererSize());
        this.resizeObserver.observe(this.container);

        document.addEventListener("visibilitychange", () => {
            this.isPageVisible = document.visibilityState === 'visible';
            // FIX: si vuelves a la pestaña después de que el modelo ya
            // cargó, también hay que reanudar el loop.
            this.resumeLoopIfNeeded();
        });

        const featureBtns = document.querySelectorAll(".feature-btn");
        const descripcionEl = document.getElementById("modelo-descripcion-dinamica");

        featureBtns.forEach((btn) => {
            btn.addEventListener("click", () => {
                featureBtns.forEach((b) => b.classList.remove("active"));
                btn.classList.add("active");
                
                const targetKey = btn.dataset.target;
                if (this.cameraTargets[targetKey] && this.model) {
                    this.targetCameraPos.copy(this.cameraTargets[targetKey].pos);
                    this.targetControlsTarget.copy(this.cameraTargets[targetKey].target);
                    this.isAnimatingCamera = true;
                    
                    if (descripcionEl && this.descriptions[targetKey]) {
                        descripcionEl.textContent = this.descriptions[targetKey];
                    }
                }
            });
        });
    }

    setupIntersectionObserver() {
        const observer = new IntersectionObserver((entries) => {
            const wasIntersecting = this.isIntersecting;
            this.isIntersecting = entries[0].isIntersecting;

            if (this.isIntersecting && !wasIntersecting) {
             
                this.resumeLoopIfNeeded();
            }
            
          
        }, { threshold: 0.1 });
        
        observer.observe(this.container);
        this.observers.push(observer);
    }

    updateRendererSize() {
        if (!this.container || !this.camera || !this.renderer) return;
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;
        
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height, false);
    }

    // Reanuda el loop de RAF solo si no está corriendo ya y se cumplen
    // las tres condiciones. Seguro de llamar desde cualquier evento
    // (carga del modelo, cambio de pestaña, IntersectionObserver, etc).
    resumeLoopIfNeeded() {
        if (!this.isAnimating && this.isIntersecting && this.isPageVisible && this.isLoaded) {
            this.animate();
        }
    }

    animate() {
        
        if (!this.isIntersecting || !this.isPageVisible || !this.isLoaded) {
            this.isAnimating = false;
            return;
        }

        this.isAnimating = true;
        requestAnimationFrame(this.animate.bind(this));

        if (this.isAnimatingCamera) {
            const lerpSpeed = 0.08;
            this.camera.position.lerp(this.targetCameraPos, lerpSpeed);
            this.controls.target.lerp(this.targetControlsTarget, lerpSpeed);
            
            if (this.camera.position.distanceTo(this.targetCameraPos) < 0.01) {
                this.isAnimatingCamera = false;
            }
        }

        this.controls.update(); 
        this.renderer.render(this.scene, this.camera);
    }

    destroy() {
        if (this.loaderElement) this.loaderElement.remove();
        if (this.resizeObserver) this.resizeObserver.disconnect();
        this.observers.forEach(o => o.disconnect());
        
        this.renderer.dispose();
        this.controls.dispose();
        
        if (this.scene) {
            this.scene.traverse((object) => {
                if (object.isMesh) {
                    if (object.geometry) object.geometry.dispose();
                    if (object.material) {
                        if (Array.isArray(object.material)) object.material.forEach(m => m.dispose());
                        else object.material.dispose();
                    }
                }
            });
        }
    }
}
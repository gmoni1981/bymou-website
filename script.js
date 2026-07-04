import * as ogl from './assets/vendor/ogl/src/index.js';

/* ============================================
   BYMOU WEBSITE EXPORT — script.js
   Standalone vanilla JS for BYMOU creative portfolio
   Direct translation of the original OGL + GSAP code
   ============================================ */

(async function () {
  'use strict';

  // ── Register GSAP plugins ──
  const hasScrollSmoother = typeof ScrollSmoother !== 'undefined';
  gsap.registerPlugin(ScrollTrigger, CustomEase);
  if (hasScrollSmoother) gsap.registerPlugin(ScrollSmoother);

  CustomEase.create('cinematicSilk', '0.45, 0.05, 0.55, 0.95');
  CustomEase.create('cinematicSmooth', '0.25, 0.1, 0.25, 1');
  CustomEase.create('cinematicFlow', '0.33, 0, 0.2, 1');
  CustomEase.create('cinematicLinear', '0.4, 0, 0.6, 1');

  // ── Configuration (matches original data.ts) ──
  const imageDirectory = './assets/images/';
  const fallbackImageFiles = [
    'hero-01.png',
    'hero-02.png',
    'hero-03.png',
    'hero-04.png',
    'hero-05.png',
    'hero-06.png',
    'hero-07.png',
    'hero-08.png',
    'hero-09.png',
    'hero-10.png',
    'hero-11.png',
    'hero-12.png',
  ];
  let images = [];

  async function discoverCarouselImages() {
    return fallbackImageFiles.map(function (file) {
      return imageDirectory + file;
    });
  }

  const perspectives = [
    { title: 'I DIRECT THINGS THAT DON’T EXIST.', description: '', position: 'top' },
    { title: 'CAMPAIGNS THAT MOVE.', description: '', position: 'center' },
    { title: 'SYSTEMS THAT SELL.', description: '', position: 'center' },
    { title: 'WORLDS PEOPLE REMEMBER.', description: '', position: 'bottom' },
  ];

  const isMobile = window.innerWidth < 768;
  const isTablet = window.innerWidth >= 768 && window.innerWidth < 1024;

  const cylinderConfig = {
    radius: isMobile ? 2.2 : 2.5,
    height: isMobile ? 1.2 : 2,
    radialSegments: 64,
    heightSegments: 1,
  };

  const particleConfig = {
    numParticles: 12,
    particleRadius: 3.3,
    segments: 20,
    angleSpan: 0.3,
  };

  const imageConfig = { width: 1024, height: 1024 };

  // ── Shaders (matches original shaders.ts) ──
  const cylinderVertex = `
    attribute vec2 uv;
    attribute vec3 position;
    uniform mat4 modelViewMatrix;
    uniform mat4 projectionMatrix;
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  const cylinderFragment = `
    precision highp float;
    uniform sampler2D tMap;
    uniform float uDarkness;
    varying vec2 vUv;
    void main() {
      vec4 tex = texture2D(tMap, vUv);
      tex.rgb *= (1.0 - uDarkness);
      gl_FragColor = tex;
    }
  `;

  const particleVertex = `
    attribute vec3 position;
    uniform mat4 modelViewMatrix;
    uniform mat4 projectionMatrix;
    void main() {
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  const particleFragment = `
    precision highp float;
    uniform vec3 uColor;
    uniform float uOpacity;
    void main() {
      gl_FragColor = vec4(uColor, uOpacity);
    }
  `;

  // ── Utility: drawImageCover (matches original utils.ts) ──
  function drawImageCover(ctx, img, x, y, w, h) {
    const imgRatio = img.naturalWidth / img.naturalHeight;
    const canvasRatio = w / h;
    let sourceX = 0, sourceY = 0, sourceWidth = img.naturalWidth, sourceHeight = img.naturalHeight;

    if (imgRatio > canvasRatio) {
      sourceWidth = img.naturalHeight * canvasRatio;
      sourceX = (img.naturalWidth - sourceWidth) / 2;
    } else {
      sourceHeight = img.naturalWidth / canvasRatio;
      sourceY = (img.naturalHeight - sourceHeight) / 2;
    }

    ctx.save();
    ctx.translate(x, y + h);
    ctx.scale(1, -1);
    ctx.drawImage(img, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, w, h);
    ctx.restore();
  }

  // ── Utility: createCylinderGeometry ──
  function createCylinderGeometry(gl, config) {
    const { radius, height, radialSegments, heightSegments } = config;
    const positions = [], uvs = [], indices = [];

    for (let y = 0; y <= heightSegments; y++) {
      const v = y / heightSegments;
      const yPos = (v - 0.5) * height;
      for (let x = 0; x <= radialSegments; x++) {
        const u = x / radialSegments;
        const theta = u * Math.PI * 2;
        positions.push(Math.cos(theta) * radius, yPos, Math.sin(theta) * radius);
        uvs.push(u, 1 - v);
      }
    }

    for (let y = 0; y < heightSegments; y++) {
      for (let x = 0; x < radialSegments; x++) {
        const a = y * (radialSegments + 1) + x;
        const b = a + radialSegments + 1;
        const c = a + 1;
        const d = b + 1;
        indices.push(a, b, c, b, d, c);
      }
    }

    return new ogl.Geometry(gl, {
      position: { size: 3, data: new Float32Array(positions) },
      uv: { size: 2, data: new Float32Array(uvs) },
      index: { data: new Uint16Array(indices) },
    });
  }

  // ── Utility: createParticleGeometry ──
  function createParticleGeometry(gl, config, index, height) {
    const { numParticles, particleRadius, segments, angleSpan } = config;
    const linePositions = [];
    const startAngle = (index / numParticles) * Math.PI * 2;
    const isTopHalf = index < numParticles / 2;
    const yPosition = isTopHalf
      ? height * 0.7 + Math.random() * height * 0.3
      : -height * 1.0 + Math.random() * height * 0.3;

    for (let j = 0; j <= segments; j++) {
      const t = j / segments;
      const angle = startAngle + angleSpan * t;
      linePositions.push(Math.cos(angle) * particleRadius, yPosition, Math.sin(angle) * particleRadius);
    }

    return {
      geometry: new ogl.Geometry(gl, {
        position: { size: 3, data: new Float32Array(linePositions) },
      }),
      userData: {
        baseAngle: startAngle,
        angleSpan: angleSpan,
        baseY: yPosition,
        speed: 0.5 + Math.random() * 1.0,
        radius: particleRadius,
      },
    };
  }

  // ── Responsive dimensions (matches original) ──
  function getResponsiveDimensions() {
    const width = window.innerWidth;
    const mob = width < 768;
    const tab = width >= 768 && width < 1024;
    const maxRadius = mob ? 1.8 : tab ? 2.2 : 2.5;
    const cameraZ = mob ? 6 : tab ? 7 : 8;
    const fov = mob ? 50 : 45;
    return {
      cylinderScale: maxRadius / cylinderConfig.radius,
      cylinderHeight: mob ? 0.8 : tab ? 1.0 : 1.2,
      cameraZ, fov, isMobile: mob,
    };
  }

  // ══════════════════════════════════════════════
  //  MAIN INIT
  // ══════════════════════════════════════════════
  images = await discoverCarouselImages();

  const canvasEl = document.getElementById('webgl-canvas');
  const smoothWrapper = document.getElementById('smooth-wrapper');
  const smoothContent = document.getElementById('smooth-content');
  const scrollSpacer = document.getElementById('scroll-spacer');
  const loaderEl = document.getElementById('loader');
  const textCards = document.querySelectorAll('.text-card');

  // ScrollSmoother is optional; the export must still run when the bonus plugin is unavailable.
  const smoother = hasScrollSmoother
    ? ScrollSmoother.create({
        wrapper: smoothWrapper,
        content: smoothContent,
        smooth: 4,
        effects: false,
        smoothTouch: 0.1,
      })
    : null;

  // OGL Renderer
  const renderer = new ogl.Renderer({
    canvas: canvasEl,
    width: window.innerWidth,
    height: window.innerHeight,
    dpr: Math.min(window.devicePixelRatio, 2),
    alpha: true,
    antialias: true,
  });
  const gl = renderer.gl;
  gl.clearColor(0, 0, 0, 1);
  gl.disable(gl.CULL_FACE);

  const dimensions = getResponsiveDimensions();

  // Camera
  const cameraOpts = { fov: dimensions.fov };
  if (dimensions.isMobile) cameraOpts.aspect = window.innerWidth / window.innerHeight;
  const camera = new ogl.Camera(gl, cameraOpts);
  camera.position.set(0, 0, dimensions.cameraZ);

  // Scene
  const scene = new ogl.Transform();

  // Geometry
  const geometry = createCylinderGeometry(gl, cylinderConfig);

  // Texture atlas canvas
  const hardwareLimit = gl.getParameter(gl.MAX_TEXTURE_SIZE);
  const isMobileDevice = window.innerWidth < 768;
  const targetAtlasWidth = imageConfig.width * images.length;
  const safeLimit = isMobileDevice ? Math.min(hardwareLimit, 2048) : Math.min(hardwareLimit, targetAtlasWidth);

  const atlasCanvas = document.createElement('canvas');
  const atlasCtx = atlasCanvas.getContext('2d', { willReadFrequently: false, alpha: false });
  const numImages = images.length;
  const totalWidthOriginal = imageConfig.width * numImages;
  const heightOriginal = imageConfig.height;
  const scale = Math.min(1, safeLimit / totalWidthOriginal);

  atlasCanvas.width = Math.floor(totalWidthOriginal * scale);
  atlasCanvas.height = Math.floor(heightOriginal * scale);

  const circumference = 2 * Math.PI * cylinderConfig.radius;
  const textureAspectRatio = imageConfig.height / (imageConfig.width * images.length);
  const idealHeight = circumference * textureAspectRatio;
  const heightCorrection = idealHeight / cylinderConfig.height;

  // Camera animation state
  const cameraAnim = { x: 0, y: 0, z: dimensions.cameraZ, rotY: 0 };

  // Refs
  let cylinderMesh = null;
  const particles = [];
  let lastRotation = 0;
  let velocity = 0;
  let momentum = 0;
  let lastWidth = window.innerWidth;

  // ── Load images ──
  let loadedImages = 0;
  const imageElements = [];

  images.forEach(function (src, index) {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = function () {
      imageElements[index] = img;
      loadedImages++;
      if (loadedImages === numImages) onAllImagesLoaded();
    };
    img.onerror = function () {
      console.error('Failed to load image:', src);
      loadedImages++;
      if (loadedImages === numImages) onAllImagesLoaded();
    };
    img.src = src;
  });

  function onAllImagesLoaded() {
    const totalCanvasWidth = atlasCanvas.width;
    const canvasHeight = atlasCanvas.height;

    // Draw all images to atlas
    imageElements.forEach(function (img, i) {
      if (!img) return;
      const xStartExact = (i / numImages) * totalCanvasWidth;
      const xEndExact = ((i + 1) / numImages) * totalCanvasWidth;
      const xPos = Math.floor(xStartExact);
      const xEnd = Math.floor(xEndExact);
      const drawWidthActual = xEnd - xPos;
      drawImageCover(atlasCtx, img, xPos, 0, drawWidthActual, canvasHeight);
    });

    // OGL Texture
    const texture = new ogl.Texture(gl, {
      wrapS: gl.CLAMP_TO_EDGE,
      wrapT: gl.CLAMP_TO_EDGE,
      minFilter: gl.LINEAR,
      magFilter: gl.LINEAR,
      generateMipmaps: false,
    });
    texture.image = atlasCanvas;
    texture.needsUpdate = true;

    // OGL Program
    const program = new ogl.Program(gl, {
      vertex: cylinderVertex,
      fragment: cylinderFragment,
      uniforms: {
        tMap: { value: texture },
        uDarkness: { value: 0.3 },
      },
      cullFace: null,
    });

    // OGL Mesh
    cylinderMesh = new ogl.Mesh(gl, { geometry: geometry, program: program });
    cylinderMesh.setParent(scene);
    cylinderMesh.rotation.y = 0.5;
    cylinderMesh.scale.set(dimensions.cylinderScale, dimensions.cylinderScale, dimensions.cylinderScale);

    // Hide loader
    loaderEl.classList.add('hidden');
    setTimeout(function () { loaderEl.style.display = 'none'; }, 600);

    // ── GSAP Timeline (matches original exactly) ──
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: scrollSpacer,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1,
      },
    });

    tl.to(cameraAnim, { x: 0, y: 0, z: dimensions.cameraZ, duration: 1, ease: 'cinematicSilk' })
      .to(cameraAnim, { x: 0, y: 5, z: 5, duration: 1, ease: 'cinematicFlow' })
      .to(cameraAnim, { x: 1.5, y: 2, z: 2, duration: 2, ease: 'cinematicLinear' })
      .to(cameraAnim, { x: 0.5, y: 0, z: 0.8, duration: 3.5, ease: 'power1.inOut' })
      .to(cameraAnim, { x: -6, y: -1, z: dimensions.cameraZ, duration: 1, ease: 'cinematicSmooth' });

    tl.to(cylinderMesh.rotation, { y: '+=28.27', duration: 8.5, ease: 'none' }, 0);

    // ── Text card animations ──
    textCards.forEach(function (textEl, index) {
      const sectionDuration = 100 / perspectives.length;
      const start = index * sectionDuration;
      const end = (index + 1) * sectionDuration;

      const textTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: scrollSpacer,
          start: start + '% top',
          end: end + '% top',
          scrub: 0.8,
        },
      });

      textTimeline
        .fromTo(textEl, { opacity: 0 }, { opacity: 1, duration: 0.2, ease: 'cinematicSmooth' })
        .to(textEl, { opacity: 1, duration: 0.6, ease: 'none' })
        .to(textEl, { opacity: 0, duration: 0.2, ease: 'cinematicSmooth' });
    });

    // ── Particles ──
    for (let i = 0; i < particleConfig.numParticles; i++) {
      const result = createParticleGeometry(gl, particleConfig, i, cylinderConfig.height);
      const lineProgram = new ogl.Program(gl, {
        vertex: particleVertex,
        fragment: particleFragment,
        uniforms: {
          uColor: { value: [1.0, 1.0, 1.0] },
          uOpacity: { value: 0.0 },
        },
        transparent: true,
        depthTest: true,
      });
      const particle = new ogl.Mesh(gl, {
        geometry: result.geometry,
        program: lineProgram,
        mode: gl.LINE_STRIP,
      });
      particle.userData = result.userData;
      particle.setParent(scene);
      particles.push(particle);
    }

    // ── Resize ──
    window.addEventListener('resize', handleResize);

    // ── Render loop ──
    function animate() {
      requestAnimationFrame(animate);

      camera.position.set(cameraAnim.x, cameraAnim.y, cameraAnim.z);
      camera.lookAt([0, 0, 0]);

      if (cylinderMesh) {
        const currentRotation = cylinderMesh.rotation.y;
        velocity = currentRotation - lastRotation;
        lastRotation = currentRotation;

        momentum = momentum * 0.92 + velocity * 0.15;

        const speed = Math.abs(velocity) * 100;
        const isRotating = Math.abs(velocity) > 0.0001;

        particles.forEach(function (particle) {
          const ud = particle.userData;
          const targetOpacity = isRotating ? Math.min(speed * 3, 0.95) : 0;
          const currentOpacity = particle.program.uniforms.uOpacity.value;
          particle.program.uniforms.uOpacity.value = currentOpacity + (targetOpacity - currentOpacity) * 0.15;

          if (isRotating) {
            const rotationOffset = velocity * ud.speed * 1.5;
            ud.baseAngle += rotationOffset;
            const segs = particleConfig.segments;
            const positions = particle.geometry.attributes.position.data;

            for (let j = 0; j <= segs; j++) {
              const t = j / segs;
              const angle = ud.baseAngle + ud.angleSpan * t;
              positions[j * 3] = Math.cos(angle) * ud.radius;
              positions[j * 3 + 1] = ud.baseY;
              positions[j * 3 + 2] = Math.sin(angle) * ud.radius;
            }
            particle.geometry.attributes.position.needsUpdate = true;
          }
        });
      }

      renderer.render({ scene: scene, camera: camera });
    }
    animate();
  }

  // ── Resize handler (matches original) ──
  function handleResize() {
    if (!cylinderMesh) return;
    const currentWidth = window.innerWidth;
    const newDim = getResponsiveDimensions();

    if (newDim.isMobile && currentWidth === lastWidth) return;
    lastWidth = currentWidth;

    renderer.setSize(currentWidth, window.innerHeight);
    camera.perspective({ fov: newDim.fov, aspect: currentWidth / window.innerHeight });

    if (newDim.isMobile) {
      cylinderMesh.scale.set(
        newDim.cylinderScale,
        newDim.cylinderScale * heightCorrection,
        newDim.cylinderScale
      );
    } else {
      cylinderMesh.scale.set(newDim.cylinderScale, newDim.cylinderScale, newDim.cylinderScale);
    }

    if (cameraAnim.z === 8 || cameraAnim.z === 7 || cameraAnim.z === 6) {
      cameraAnim.z = newDim.cameraZ;
    }
  }

})();

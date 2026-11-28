"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { RotateCcw, Play, Pause, Sparkles } from "lucide-react";

export default function CopperVase3D() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [isRotating, setIsRotating] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // References for animation state
  const stateRef = useRef({
    isDragging: false,
    previousMousePosition: { x: 0, y: 0 },
    rotationVelocity: { x: 0, y: 0.003 },
    targetRotation: { x: 0.08, y: 0 },
    currentRotation: { x: 0.08, y: 0 },
    autoRotate: true,
    resetTrigger: false,
  });

  useEffect(() => {
    stateRef.current.autoRotate = isRotating;
  }, [isRotating]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // --- 1. Scene, Camera, Renderer ---
    const width = container.clientWidth || 540;
    const height = container.clientHeight || 580;

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    camera.position.set(0, 0.6, 5.2);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0); // 100% transparent, ZERO background box
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(renderer.domElement);
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.cursor = "grab";

    // --- 2. Master Model Group ---
    const modelGroup = new THREE.Group();
    scene.add(modelGroup);

    // --- 3. Procedural Hammered Copper Texture ---
    // Create authentic hammered dimples normal/bump texture via canvas
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.fillStyle = "#808080";
      ctx.fillRect(0, 0, 512, 512);

      // Draw cellular hammered dimples
      for (let i = 0; i < 900; i++) {
        const x = Math.random() * 512;
        const y = Math.random() * 512;
        const radius = 6 + Math.random() * 10;
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
        gradient.addColorStop(0, "rgba(255, 255, 255, 0.35)");
        gradient.addColorStop(0.6, "rgba(200, 200, 200, 0.15)");
        gradient.addColorStop(1, "rgba(80, 80, 80, 0)");
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const bumpTexture = new THREE.CanvasTexture(canvas);
    bumpTexture.wrapS = THREE.RepeatWrapping;
    bumpTexture.wrapT = THREE.RepeatWrapping;
    bumpTexture.repeat.set(4, 4);

    // --- 4. Luxury Copper Material ---
    const copperMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0xd97c38), // Rich polished Boyolali copper
      roughness: 0.22,
      metalness: 0.92,
      bumpMap: bumpTexture,
      bumpScale: 0.018,
      envMapIntensity: 1.2,
    });

    const darkBronzeMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0x5c3319),
      roughness: 0.35,
      metalness: 0.85,
    });

    // --- 5. Handcrafted Copper Vase Geometry ---
    // Define an elegant Boyolali artisan vase silhouette
    const points: THREE.Vector2[] = [];
    // Base & foot
    points.push(new THREE.Vector2(0, -1.5));
    points.push(new THREE.Vector2(0.55, -1.5));
    points.push(new THREE.Vector2(0.58, -1.45));
    points.push(new THREE.Vector2(0.48, -1.35));
    // Taper into swelling bulbous body
    points.push(new THREE.Vector2(0.42, -1.1));
    points.push(new THREE.Vector2(0.65, -0.7));
    points.push(new THREE.Vector2(0.92, -0.2));
    points.push(new THREE.Vector2(0.98, 0.1));
    points.push(new THREE.Vector2(0.85, 0.45));
    // Shoulder into slender neck
    points.push(new THREE.Vector2(0.62, 0.75));
    points.push(new THREE.Vector2(0.38, 1.05));
    points.push(new THREE.Vector2(0.32, 1.35));
    points.push(new THREE.Vector2(0.34, 1.55));
    // Flared rim & decorative lip
    points.push(new THREE.Vector2(0.48, 1.72));
    points.push(new THREE.Vector2(0.58, 1.78));
    points.push(new THREE.Vector2(0.54, 1.8));
    points.push(new THREE.Vector2(0.42, 1.75));
    // Inner lip
    points.push(new THREE.Vector2(0.3, 1.55));
    points.push(new THREE.Vector2(0.26, 1.2));
    points.push(new THREE.Vector2(0.1, 0.9));

    const latheGeometry = new THREE.LatheGeometry(points, 64);
    const vaseMesh = new THREE.Mesh(latheGeometry, copperMaterial);
    vaseMesh.castShadow = true;
    vaseMesh.receiveShadow = true;
    modelGroup.add(vaseMesh);

    // Decorative embossed copper rings around waist and neck
    const waistRingGeo = new THREE.TorusGeometry(0.94, 0.025, 24, 64);
    waistRingGeo.rotateX(Math.PI / 2);
    const waistRing = new THREE.Mesh(waistRingGeo, darkBronzeMaterial);
    waistRing.position.y = 0.1;
    modelGroup.add(waistRing);

    const neckRingGeo = new THREE.TorusGeometry(0.37, 0.02, 24, 64);
    neckRingGeo.rotateX(Math.PI / 2);
    const neckRing = new THREE.Mesh(neckRingGeo, darkBronzeMaterial);
    neckRing.position.y = 1.25;
    modelGroup.add(neckRing);

    // Dual artisan sculpted copper scroll handles
    const createHandle = (angle: number) => {
      const handleCurve = new THREE.CubicBezierCurve3(
        new THREE.Vector3(0.36, 1.45, 0),
        new THREE.Vector3(0.88, 1.52, 0),
        new THREE.Vector3(0.98, 0.75, 0),
        new THREE.Vector3(0.72, 0.65, 0)
      );
      const handleGeo = new THREE.TubeGeometry(handleCurve, 40, 0.038, 16, false);
      const handleMesh = new THREE.Mesh(handleGeo, copperMaterial);
      handleMesh.rotation.y = angle;
      return handleMesh;
    };
    modelGroup.add(createHandle(0));
    modelGroup.add(createHandle(Math.PI));

    // --- 6. Luxury Dried Botanicals / Flowers inside Vase ---
    const flowerGroup = new THREE.Group();
    flowerGroup.position.set(0, 1.6, 0);

    const stemMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0x6b533a),
      roughness: 0.8,
    });
    const pampasMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0xf2e4d2), // Fluffy cream pampas
      roughness: 0.9,
    });
    const bronzeLeafMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0xb26b38), // Golden bronze dried leaves
      roughness: 0.4,
      metalness: 0.6,
    });

    // Add stems and decorative plumes
    for (let i = 0; i < 9; i++) {
      const angle = (i / 9) * Math.PI * 2 + Math.random() * 0.3;
      const height = 1.0 + Math.random() * 0.7;
      const lean = 0.18 + Math.random() * 0.22;

      // Stem
      const stemCurve = new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(Math.cos(angle) * lean * 0.5, height * 0.5, Math.sin(angle) * lean * 0.5),
        new THREE.Vector3(Math.cos(angle) * lean, height, Math.sin(angle) * lean)
      );
      const stemGeo = new THREE.TubeGeometry(stemCurve, 16, 0.014, 8, false);
      const stem = new THREE.Mesh(stemGeo, stemMaterial);
      flowerGroup.add(stem);

      // Plume / Dried botanical head
      const plumeGeo = new THREE.ConeGeometry(0.12 + Math.random() * 0.06, 0.5 + Math.random() * 0.3, 12);
      plumeGeo.translate(0, 0.25, 0);
      const plume = new THREE.Mesh(plumeGeo, i % 2 === 0 ? pampasMaterial : bronzeLeafMaterial);
      plume.position.set(Math.cos(angle) * lean, height, Math.sin(angle) * lean);
      plume.rotation.z = Math.cos(angle) * 0.4;
      plume.rotation.x = -Math.sin(angle) * 0.4;
      flowerGroup.add(plume);
    }
    modelGroup.add(flowerGroup);

    // --- 7. Soft Ground Contact Shadow (Radial gradient on plane) ---
    const shadowCanvas = document.createElement("canvas");
    shadowCanvas.width = 256;
    shadowCanvas.height = 256;
    const shadowCtx = shadowCanvas.getContext("2d");
    if (shadowCtx) {
      const grad = shadowCtx.createRadialGradient(128, 128, 0, 128, 128, 128);
      grad.addColorStop(0, "rgba(25, 12, 5, 0.45)");
      grad.addColorStop(0.35, "rgba(35, 18, 8, 0.25)");
      grad.addColorStop(0.7, "rgba(50, 25, 12, 0.08)");
      grad.addColorStop(1, "rgba(0, 0, 0, 0)");
      shadowCtx.fillStyle = grad;
      shadowCtx.fillRect(0, 0, 256, 256);
    }
    const shadowTexture = new THREE.CanvasTexture(shadowCanvas);
    const shadowGeo = new THREE.PlaneGeometry(3.6, 3.6);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTexture,
      transparent: true,
      opacity: 0.8,
      depthWrite: false,
    });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.y = -1.51;
    scene.add(shadowMesh);

    // --- 8. Studio Lighting Rig ---
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xfff5eb, 1.1);
    scene.add(ambientLight);

    // Main key light (Warm copper highlight)
    const keyLight = new THREE.DirectionalLight(0xffe6cc, 2.8);
    keyLight.position.set(4, 5, 4);
    keyLight.castShadow = true;
    scene.add(keyLight);

    // Fill light from left
    const fillLight = new THREE.DirectionalLight(0xd9b38c, 1.4);
    fillLight.position.set(-4, 2, 2);
    scene.add(fillLight);

    // Rim light from behind (Glow on silhouette edge)
    const rimLight = new THREE.DirectionalLight(0xffa756, 2.2);
    rimLight.position.set(0, 4, -4);
    scene.add(rimLight);

    // Soft point light right in front of the vase
    const frontPoint = new THREE.PointLight(0xfff0db, 1.2, 10);
    frontPoint.position.set(0, 0.5, 3);
    scene.add(frontPoint);

    // --- 9. Interactive Drag & Touch Handlers ---
    const onMouseDown = (e: MouseEvent) => {
      stateRef.current.isDragging = true;
      setIsDragging(true);
      setHasInteracted(true);
      stateRef.current.previousMousePosition = { x: e.clientX, y: e.clientY };
      renderer.domElement.style.cursor = "grabbing";
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!stateRef.current.isDragging) return;
      const deltaX = e.clientX - stateRef.current.previousMousePosition.x;
      const deltaY = e.clientY - stateRef.current.previousMousePosition.y;

      stateRef.current.rotationVelocity.y = deltaX * 0.008;
      stateRef.current.rotationVelocity.x = deltaY * 0.005;

      stateRef.current.targetRotation.y += deltaX * 0.008;
      stateRef.current.targetRotation.x = Math.max(
        -0.25,
        Math.min(0.35, stateRef.current.targetRotation.x + deltaY * 0.005)
      );

      stateRef.current.previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      stateRef.current.isDragging = false;
      setIsDragging(false);
      renderer.domElement.style.cursor = "grab";
    };

    // Mobile touch handling
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        stateRef.current.isDragging = true;
        setIsDragging(true);
        setHasInteracted(true);
        stateRef.current.previousMousePosition = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY,
        };
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!stateRef.current.isDragging || e.touches.length !== 1) return;
      const deltaX = e.touches[0].clientX - stateRef.current.previousMousePosition.x;
      const deltaY = e.touches[0].clientY - stateRef.current.previousMousePosition.y;

      stateRef.current.rotationVelocity.y = deltaX * 0.009;
      stateRef.current.rotationVelocity.x = deltaY * 0.006;

      stateRef.current.targetRotation.y += deltaX * 0.009;
      stateRef.current.targetRotation.x = Math.max(
        -0.25,
        Math.min(0.35, stateRef.current.targetRotation.x + deltaY * 0.006)
      );

      stateRef.current.previousMousePosition = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };
    };

    const onTouchEnd = () => {
      stateRef.current.isDragging = false;
      setIsDragging(false);
    };

    const dom = renderer.domElement;
    dom.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    dom.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onTouchEnd);

    // --- 10. Responsive Resize Handler ---
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    // --- 11. Render Animation Loop with Smooth Damping ---
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // Auto-rotation when not dragging
      if (!stateRef.current.isDragging && stateRef.current.autoRotate) {
        stateRef.current.targetRotation.y += 0.004;
      }

      // Smooth inertia / damping
      stateRef.current.currentRotation.x +=
        (stateRef.current.targetRotation.x - stateRef.current.currentRotation.x) * 0.08;
      stateRef.current.currentRotation.y +=
        (stateRef.current.targetRotation.y - stateRef.current.currentRotation.y) * 0.08;

      modelGroup.rotation.x = stateRef.current.currentRotation.x;
      modelGroup.rotation.y = stateRef.current.currentRotation.y;

      // Slight floating motion
      const time = Date.now() * 0.0015;
      modelGroup.position.y = Math.sin(time) * 0.04;

      renderer.render(scene, camera);
    };
    animate();

    // --- 12. Cleanup on Unmount ---
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      dom.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      dom.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      latheGeometry.dispose();
      copperMaterial.dispose();
      bumpTexture.dispose();
      shadowTexture.dispose();
    };
  }, []);

  const handleReset = () => {
    stateRef.current.targetRotation.y = 0;
    stateRef.current.targetRotation.x = 0.08;
  };

  if (!mounted) {
    return (
      <div className="relative w-full h-[480px] sm:h-[540px] lg:h-[620px] select-none flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#b87333]/30 border-t-[#b87333] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="relative w-full h-[480px] sm:h-[540px] lg:h-[620px] select-none flex items-center justify-center">
      {/* 3D WebGL Canvas Container with ZERO background box */}
      <div
        ref={containerRef}
        className="w-full h-full relative z-10 touch-none flex items-center justify-center"
        title="Klik dan seret untuk memutar 360°"
      />

      {/* Floating 360° Interactive HUD Controls (Pill Style) */}
      <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/85 backdrop-blur-md border border-[#ebd8cb] shadow-[0_10px_25px_-5px_rgba(184,115,51,0.22)]">
        {/* 360 badge with sparkle */}
        <div className="flex items-center gap-1.5 text-[#9e5b24] font-bold text-xs tracking-wider uppercase">
          <Sparkles className="w-3.5 h-3.5 text-[#b87333] animate-pulse" />
          <span>360° 3D View</span>
        </div>

        <div className="w-[1px] h-4 bg-stone-300 mx-1" />

        {/* Toggle Auto Rotation Button */}
        <button
          type="button"
          onClick={() => setIsRotating(!isRotating)}
          className="p-1.5 rounded-full hover:bg-stone-100 text-stone-600 hover:text-[#b87333] transition-colors"
          title={isRotating ? "Jeda putaran otomatis" : "Lanjutkan putaran"}
          aria-label={isRotating ? "Pause rotation" : "Play rotation"}
        >
          {isRotating ? (
            <Pause className="w-3.5 h-3.5" />
          ) : (
            <Play className="w-3.5 h-3.5" />
          )}
        </button>

        {/* Reset View Button */}
        <button
          type="button"
          onClick={handleReset}
          className="p-1.5 rounded-full hover:bg-stone-100 text-stone-600 hover:text-[#b87333] transition-colors"
          title="Reset sudut pandang"
          aria-label="Reset view"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Subtle Drag Hint Overlay (disappears after interaction) */}
      {!hasInteracted && (
        <div className="absolute top-8 right-6 pointer-events-none z-20 hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-sm border border-white/20 text-white text-[11px] font-medium tracking-wide animate-bounce">
          <span>👈 Geser untuk memutar 360°</span>
        </div>
      )}
    </div>
  );
}


"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";

export default function Watch3DExperience() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isInteracting, setIsInteracting] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();

    const width = container.clientWidth || 400;
    const height = container.clientHeight || 400;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 2.2, 5.5);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;
    container.appendChild(renderer.domElement);

    // 2. Pure Studio Lighting (Cool White Key & Soft Warm Gold Rim)
    const ambientLight = new THREE.AmbientLight(0x161616, 2.2);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.8);
    keyLight.position.set(4, 7, 5);
    scene.add(keyLight);

    const goldRimLight = new THREE.DirectionalLight(0xd4af37, 1.8);
    goldRimLight.position.set(-5, 4, -4);
    scene.add(goldRimLight);

    const fillLight = new THREE.DirectionalLight(0x71717a, 1.2);
    fillLight.position.set(0, -4, 3);
    scene.add(fillLight);

    // 3. 3D Model Group: Swiss Horology Stainless Steel & Obsidian
    const watchGroup = new THREE.Group();
    scene.add(watchGroup);

    // 18K Champagne Gold Accent Material
    const goldMaterial = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      roughness: 0.18,
      metalness: 0.92,
    });

    // Oystersteel 316L Case Material
    const steelMaterial = new THREE.MeshStandardMaterial({
      color: 0xdddddd,
      roughness: 0.18,
      metalness: 0.92,
    });

    // Pure Obsidian Black Dial Material
    const obsidianDialMaterial = new THREE.MeshStandardMaterial({
      color: 0x090909,
      roughness: 0.3,
      metalness: 0.1,
    });

    // Sapphire Crystal Glass Material
    const sapphireMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transmission: 0.92,
      opacity: 1,
      transparent: true,
      roughness: 0.04,
      ior: 1.77,
      reflectivity: 0.8,
    });

    // Watch Case
    const caseGeo = new THREE.CylinderGeometry(1.85, 1.8, 0.42, 64);
    const caseMesh = new THREE.Mesh(caseGeo, steelMaterial);
    watchGroup.add(caseMesh);

    // Fluted Gold Bezel Ring
    const bezelGeo = new THREE.TorusGeometry(1.82, 0.1, 16, 64);
    bezelGeo.rotateX(Math.PI / 2);
    bezelGeo.translate(0, 0.21, 0);
    const bezelMesh = new THREE.Mesh(bezelGeo, goldMaterial);
    watchGroup.add(bezelMesh);

    // Obsidian Dial
    const dialGeo = new THREE.CircleGeometry(1.72, 64);
    dialGeo.rotateX(-Math.PI / 2);
    dialGeo.translate(0, 0.215, 0);
    const dialMesh = new THREE.Mesh(dialGeo, obsidianDialMaterial);
    watchGroup.add(dialMesh);

    // Sapphire Crystal Glass
    const glassGeo = new THREE.CylinderGeometry(1.76, 1.76, 0.03, 64);
    glassGeo.translate(0, 0.24, 0);
    const glassMesh = new THREE.Mesh(glassGeo, sapphireMaterial);
    watchGroup.add(glassMesh);

    // Winding Crown
    const crownGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.28, 24);
    crownGeo.rotateZ(Math.PI / 2);
    crownGeo.translate(1.98, 0, 0);
    const crownMesh = new THREE.Mesh(crownGeo, goldMaterial);
    watchGroup.add(crownMesh);

    // 12 Gold Markers
    for (let i = 0; i < 12; i++) {
      const angle = (i * Math.PI) / 6;
      const markerGeo = new THREE.BoxGeometry(0.07, 0.02, i % 3 === 0 ? 0.32 : 0.16);
      const markerMesh = new THREE.Mesh(markerGeo, goldMaterial);
      markerMesh.position.set(Math.sin(angle) * 1.45, 0.22, Math.cos(angle) * 1.45);
      markerMesh.rotation.y = angle;
      watchGroup.add(markerMesh);
    }

    // Hands Group
    const handsGroup = new THREE.Group();
    handsGroup.position.set(0, 0.23, 0);
    watchGroup.add(handsGroup);

    // Hour Hand
    const hourHandGeo = new THREE.BoxGeometry(0.08, 0.02, 0.85);
    hourHandGeo.translate(0, 0, 0.42);
    const hourHand = new THREE.Mesh(hourHandGeo, goldMaterial);
    handsGroup.add(hourHand);

    // Minute Hand
    const minuteHandGeo = new THREE.BoxGeometry(0.05, 0.02, 1.35);
    minuteHandGeo.translate(0, 0, 0.67);
    const minuteHand = new THREE.Mesh(minuteHandGeo, goldMaterial);
    handsGroup.add(minuteHand);

    // Center Cap
    const capGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.04, 16);
    const capMesh = new THREE.Mesh(capGeo, goldMaterial);
    capMesh.position.set(0, 0.02, 0);
    handsGroup.add(capMesh);

    // Initial tilt
    watchGroup.rotation.x = 0.52;
    watchGroup.rotation.y = -0.3;

    // Interactive Drag / Touch
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      setIsInteracting(true);
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - prevMouseX;
      const deltaY = e.clientY - prevMouseY;
      watchGroup.rotation.y += deltaX * 0.01;
      watchGroup.rotation.x += deltaY * 0.01;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseUp = () => {
      isDragging = false;
      setIsInteracting(false);
    };

    const domElement = renderer.domElement;
    domElement.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    // Touch support
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isDragging = true;
        setIsInteracting(true);
        prevMouseX = e.touches[0].clientX;
        prevMouseY = e.touches[0].clientY;
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!isDragging || e.touches.length !== 1) return;
      const deltaX = e.touches[0].clientX - prevMouseX;
      const deltaY = e.touches[0].clientY - prevMouseY;
      watchGroup.rotation.y += deltaX * 0.01;
      watchGroup.rotation.x += deltaY * 0.01;
      prevMouseX = e.touches[0].clientX;
      prevMouseY = e.touches[0].clientY;
    };

    domElement.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onMouseUp);

    // Animation Loop
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      if (!isDragging) {
        watchGroup.rotation.y += 0.005;
      }

      hourHand.rotation.y = elapsedTime * 0.04;
      minuteHand.rotation.y = elapsedTime * 0.45;

      renderer.render(scene, camera);
    };

    animate();

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      const newW = container.clientWidth;
      const newH = container.clientHeight;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onMouseUp);
      domElement.removeEventListener("mousedown", onMouseDown);
      domElement.removeEventListener("touchstart", onTouchStart);
      cancelAnimationFrame(animationFrameId);
      renderer.dispose();
      if (container && renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div className="relative w-full h-[360px] sm:h-[420px] flex items-center justify-center cursor-grab active:cursor-grabbing">
      <div ref={containerRef} className="w-full h-full" />
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-[#090909]/90 backdrop-blur-md px-4 py-1 rounded-full border border-white/[0.08] text-[10px] font-mono uppercase tracking-[0.16em] text-zinc-300 pointer-events-none">
        {isInteracting ? "Aylantirilmoqda..." : "360° Aylantirish"}
      </div>
    </div>
  );
}

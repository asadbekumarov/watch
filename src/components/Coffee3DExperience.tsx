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
    camera.position.set(0, 2.5, 6);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    container.appendChild(renderer.domElement);

    // 2. Studio Lighting (Swiss Horology Neutral High-Contrast & Gold Rim)
    const ambientLight = new THREE.AmbientLight(0x161616, 2.0);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 3.0);
    keyLight.position.set(5, 8, 5);
    scene.add(keyLight);

    const rimLightGold = new THREE.DirectionalLight(0xd4af37, 2.8);
    rimLightGold.position.set(-6, 3, -4);
    scene.add(rimLightGold);

    const fillLight = new THREE.DirectionalLight(0x8e8e93, 1.5);
    fillLight.position.set(0, -5, 3);
    scene.add(fillLight);

    // 3. 3D Model Group: Luxury Watch Case & Bezel
    const watchGroup = new THREE.Group();
    scene.add(watchGroup);

    // Oystersteel 904L Material
    const steelMaterial = new THREE.MeshStandardMaterial({
      color: 0xdddddd,
      roughness: 0.15,
      metalness: 0.95,
    });

    // 18K Champagne Gold Material
    const goldMaterial = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      roughness: 0.2,
      metalness: 0.9,
    });

    // Deep Obsidian Dial Material
    const dialMaterial = new THREE.MeshStandardMaterial({
      color: 0x090909,
      roughness: 0.3,
      metalness: 0.1,
    });

    // Sapphire Glass Material
    const sapphireMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transmission: 0.9,
      opacity: 1,
      transparent: true,
      roughness: 0.05,
      ior: 1.77, // Real Sapphire IOR
      reflectivity: 0.8,
    });

    // Watch Case (Cylinder)
    const caseGeo = new THREE.CylinderGeometry(1.9, 1.85, 0.45, 64);
    const caseMesh = new THREE.Mesh(caseGeo, steelMaterial);
    watchGroup.add(caseMesh);

    // Gold Fluted Bezel (Torus)
    const bezelGeo = new THREE.TorusGeometry(1.88, 0.12, 16, 64);
    bezelGeo.rotateX(Math.PI / 2);
    bezelGeo.translate(0, 0.23, 0);
    const bezelMesh = new THREE.Mesh(bezelGeo, goldMaterial);
    watchGroup.add(bezelMesh);

    // Watch Dial
    const dialGeo = new THREE.CircleGeometry(1.78, 64);
    dialGeo.rotateX(-Math.PI / 2);
    dialGeo.translate(0, 0.22, 0);
    const dialMesh = new THREE.Mesh(dialGeo, dialMaterial);
    watchGroup.add(dialMesh);

    // Sapphire Crystal
    const glassGeo = new THREE.CylinderGeometry(1.82, 1.82, 0.04, 64);
    glassGeo.translate(0, 0.26, 0);
    const glassMesh = new THREE.Mesh(glassGeo, sapphireMaterial);
    watchGroup.add(glassMesh);

    // Winding Crown
    const crownGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.3, 24);
    crownGeo.rotateZ(Math.PI / 2);
    crownGeo.translate(2.05, 0, 0);
    const crownMesh = new THREE.Mesh(crownGeo, goldMaterial);
    watchGroup.add(crownMesh);

    // Hour Markers (12 markers in gold)
    for (let i = 0; i < 12; i++) {
      const angle = (i * Math.PI) / 6;
      const markerGeo = new THREE.BoxGeometry(0.08, 0.02, i % 3 === 0 ? 0.3 : 0.18);
      const markerMesh = new THREE.Mesh(markerGeo, goldMaterial);
      markerMesh.position.set(Math.sin(angle) * 1.5, 0.23, Math.cos(angle) * 1.5);
      markerMesh.rotation.y = angle;
      watchGroup.add(markerMesh);
    }

    // Hands Group
    const handsGroup = new THREE.Group();
    handsGroup.position.set(0, 0.24, 0);
    watchGroup.add(handsGroup);

    // Hour Hand
    const hourHandGeo = new THREE.BoxGeometry(0.08, 0.02, 0.8);
    hourHandGeo.translate(0, 0, 0.4);
    const hourHand = new THREE.Mesh(hourHandGeo, goldMaterial);
    handsGroup.add(hourHand);

    // Minute Hand
    const minuteHandGeo = new THREE.BoxGeometry(0.06, 0.02, 1.3);
    minuteHandGeo.translate(0, 0.01, 0.65);
    const minuteHand = new THREE.Mesh(minuteHandGeo, goldMaterial);
    handsGroup.add(minuteHand);

    // Center Cap
    const capGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.05, 16);
    const capMesh = new THREE.Mesh(capGeo, goldMaterial);
    capMesh.position.set(0, 0.025, 0);
    handsGroup.add(capMesh);

    // Initial tilt for realistic showcase
    watchGroup.rotation.x = 0.55;
    watchGroup.rotation.y = -0.35;

    // Interactive Drag
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

      // Smooth idle rotation when not dragging
      if (!isDragging) {
        watchGroup.rotation.y += 0.005;
      }

      // Smooth clock hands movement
      hourHand.rotation.y = elapsedTime * 0.05;
      minuteHand.rotation.y = elapsedTime * 0.5;

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
    <div className="relative w-full h-[400px] flex items-center justify-center cursor-grab active:cursor-grabbing">
      <div ref={containerRef} className="w-full h-full" />
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-[#090909]/80 backdrop-blur-md px-4 py-1.5 rounded-full border border-[#D4AF37]/30 text-[11px] font-mono uppercase tracking-wider text-[#D4AF37] pointer-events-none">
        {isInteracting ? "Aylantirilmoqda..." : "360° Aylantirish uchun ushlang"}
      </div>
    </div>
  );
}

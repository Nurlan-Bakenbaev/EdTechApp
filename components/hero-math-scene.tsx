"use client";

import { useEffect, useRef } from "react";
import type * as THREE from "three";

type FloatingShape = {
  mesh: THREE.Mesh;
  anchorX: number;
  anchorY: number;
  baseZ: number;
  phase: number;
  speed: number;
  rotation: [number, number, number];
};

export function HeroMathScene() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let disposed = false;
    let cleanup: (() => void) | undefined;

    async function start() {
      const host = containerRef.current;
      if (!host) return;
      const sceneHost: HTMLDivElement = host;

      try {
        const THREE = await import("three");
        if (disposed) return;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
        camera.position.z = 10.5;

        const renderer = new THREE.WebGLRenderer({
          alpha: true,
          antialias: window.innerWidth > 560,
          powerPreference: "low-power",
        });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, window.innerWidth > 560 ? 1.75 : 1.25));
        renderer.setSize(sceneHost.clientWidth, sceneHost.clientHeight);
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.domElement.setAttribute("aria-hidden", "true");
        sceneHost.appendChild(renderer.domElement);

        scene.add(new THREE.AmbientLight(0xffffff, 2.4));
        const keyLight = new THREE.DirectionalLight(0xffffff, 2.8);
        keyLight.position.set(-3, 5, 8);
        scene.add(keyLight);

        const material = (color: number) =>
          new THREE.MeshStandardMaterial({
            color,
            emissive: color,
            emissiveIntensity: 0.12,
            metalness: 0.08,
            roughness: 0.32,
          });

        const shapes: FloatingShape[] = [
          { mesh: new THREE.Mesh(new THREE.IcosahedronGeometry(0.86, 1), material(0xf3b84d)), anchorX: -0.25, anchorY: 0.32, baseZ: -0.7, phase: 0.2, speed: 0.52, rotation: [0.3, 0.1, 0.2] },
          { mesh: new THREE.Mesh(new THREE.TorusGeometry(0.73, 0.2, 16, 44), material(0x8fcfe4)), anchorX: 0.25, anchorY: 0.32, baseZ: 0.7, phase: 1.4, speed: 0.46, rotation: [0.8, 0.2, 0.4] },
          { mesh: new THREE.Mesh(new THREE.OctahedronGeometry(0.82, 0), material(0xf18b7d)), anchorX: -0.25, anchorY: 0, baseZ: 0.25, phase: 2.4, speed: 0.58, rotation: [0.2, 0.6, 0.1] },
          { mesh: new THREE.Mesh(new THREE.DodecahedronGeometry(0.76, 0), material(0xa9d9b9)), anchorX: 0.25, anchorY: 0, baseZ: -0.8, phase: 3.2, speed: 0.5, rotation: [0.5, 0.3, 0.7] },
          { mesh: new THREE.Mesh(new THREE.TorusGeometry(0.52, 0.16, 12, 32), material(0xb7a9e8)), anchorX: -0.25, anchorY: -0.32, baseZ: 0.1, phase: 4.4, speed: 0.42, rotation: [0.1, 0.8, 0.3] },
          { mesh: new THREE.Mesh(new THREE.ConeGeometry(0.66, 1.18, 6), material(0xf2a9c4)), anchorX: 0.25, anchorY: -0.32, baseZ: -0.6, phase: 5.5, speed: 0.48, rotation: [0.7, 0.4, 0.2] },
        ];

        shapes.forEach(({ mesh, baseZ, rotation }) => {
          mesh.position.z = baseZ;
          mesh.rotation.set(...rotation);
          mesh.scale.setScalar(0.68);
          scene.add(mesh);
        });

        const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
        const canAnimate = () => !reducedMotion.matches;
        const pointer = { x: 0, y: 0, targetX: 0, targetY: 0 };
        let frameId = 0;
        let visible = true;
        const timer = new THREE.Timer();
        timer.connect(document);

        function resize() {
          const width = Math.max(sceneHost.clientWidth, 1);
          const height = Math.max(sceneHost.clientHeight, 1);
          camera.aspect = width / height;
          camera.updateProjectionMatrix();
          renderer.setSize(width, height);
          const visibleHeight = 2 * camera.position.z * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
          const visibleWidth = visibleHeight * camera.aspect;
          shapes.forEach(({ mesh, anchorX, anchorY }) => {
            mesh.position.x = anchorX * visibleWidth;
            mesh.position.y = anchorY * visibleHeight;
          });
        }

        function onPointerMove(event: PointerEvent) {
          const bounds = sceneHost.getBoundingClientRect();
          pointer.targetX = ((event.clientX - bounds.left) / bounds.width - 0.5) * 0.75;
          pointer.targetY = ((event.clientY - bounds.top) / bounds.height - 0.5) * 0.65;
        }

        function render(timestamp?: number) {
          if (disposed || !visible) return;

          timer.update(timestamp);
          const elapsed = timer.getElapsed();
          const easing = 1 - Math.exp(-4 * Math.min(timer.getDelta(), 0.05));
          pointer.x += (pointer.targetX - pointer.x) * easing;
          pointer.y += (pointer.targetY - pointer.y) * easing;
          scene.rotation.y = pointer.x;
          scene.rotation.x = -pointer.y;
          const visibleHeight = 2 * camera.position.z * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
          const visibleWidth = visibleHeight * camera.aspect;

          shapes.forEach(({ mesh, anchorX, anchorY, baseZ, phase, speed, rotation }) => {
            if (canAnimate()) {
              mesh.position.x = anchorX * visibleWidth + Math.sin(elapsed * speed * 0.8 + phase) * 0.08;
              mesh.position.y = anchorY * visibleHeight + Math.sin(elapsed * speed + phase) * 0.12;
              mesh.position.z = baseZ + Math.cos(elapsed * speed * 0.7 + phase) * 0.12;
              mesh.rotation.x = rotation[0] + Math.sin(elapsed * speed * 0.7 + phase) * 0.14;
              mesh.rotation.y = rotation[1] + elapsed * speed * 0.22;
              mesh.rotation.z = rotation[2] + Math.cos(elapsed * speed * 0.6 + phase) * 0.1;
            } else {
              mesh.position.x = anchorX * visibleWidth;
              mesh.position.y = anchorY * visibleHeight;
              mesh.position.z = baseZ;
              mesh.rotation.set(...rotation);
            }
          });

          renderer.render(scene, camera);
          if (canAnimate()) {
            frameId = window.requestAnimationFrame(render);
          }
        }

        function onMotionPreferenceChange() {
          if (frameId) window.cancelAnimationFrame(frameId);
          frameId = 0;
          render();
        }

        const observer = new IntersectionObserver(([entry]) => {
          visible = entry.isIntersecting;
          if (visible && !frameId && canAnimate()) {
            timer.reset();
            render();
          }
          if (!visible && frameId) {
            window.cancelAnimationFrame(frameId);
            frameId = 0;
          }
        });

        observer.observe(sceneHost);
        window.addEventListener("resize", resize);
        sceneHost.addEventListener("pointermove", onPointerMove);
        reducedMotion.addEventListener("change", onMotionPreferenceChange);
        resize();
        render();

        cleanup = () => {
          observer.disconnect();
          window.removeEventListener("resize", resize);
          sceneHost.removeEventListener("pointermove", onPointerMove);
          reducedMotion.removeEventListener("change", onMotionPreferenceChange);
          if (frameId) window.cancelAnimationFrame(frameId);
          timer.dispose();
          shapes.forEach(({ mesh }) => {
            mesh.geometry.dispose();
            const meshMaterial = mesh.material;
            if (Array.isArray(meshMaterial)) meshMaterial.forEach((item) => item.dispose());
            else meshMaterial.dispose();
          });
          renderer.dispose();
          renderer.domElement.remove();
        };
      } catch (error) {
        if (error instanceof Error) {
          console.warn("The decorative 3D hero scene could not be started.", error);
        }
      }
    }

    void start();
    return () => {
      disposed = true;
      cleanup?.();
    };
  }, []);

  return <div className="hero-3d-canvas" ref={containerRef} />;
}

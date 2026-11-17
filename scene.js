import * as THREE from "three";

export function initScene(canvas) {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "low-power" });
  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x07090a, 5, 14);
  const cam = new THREE.PerspectiveCamera(50, 1, 0.1, 50);
  cam.position.set(0, 0, 6);

  const gem = new THREE.Mesh(new THREE.IcosahedronGeometry(1.7, 1), new THREE.MeshStandardMaterial({ color: 0x15181a, metalness: 0.9, roughness: 0.3, flatShading: true }));
  gem.add(new THREE.LineSegments(new THREE.EdgesGeometry(gem.geometry), new THREE.LineBasicMaterial({ color: 0x34c789, transparent: true, opacity: 0.3 })));
  scene.add(gem);

  const floor = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), new THREE.MeshStandardMaterial({ color: 0x0c0f10, metalness: 1, roughness: 0.4 }));
  floor.rotation.x = -Math.PI / 2; floor.position.y = -2.4; scene.add(floor);

  const pos = new Float32Array((innerWidth < 700 ? 250 : 600) * 3);
  for (let i = 0; i < pos.length; i++) pos[i] = (Math.random() - 0.5) * (i % 3 === 1 ? 7 : 16);
  const pg = new THREE.BufferGeometry(); pg.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  const dust = new THREE.Points(pg, new THREE.PointsMaterial({ color: 0xa3a8ad, size: 0.02, transparent: true, opacity: 0.55 }));
  scene.add(dust, new THREE.AmbientLight(0xffffff, 0.25));
  const key = new THREE.DirectionalLight(0xe9ece8, 1.4); key.position.set(-3, 4, 4); scene.add(key);
  const rim = new THREE.PointLight(0x34c789, 30, 12); rim.position.set(3, 1.5, 2); scene.add(rim);

  const m = { x: 0, y: 0 }; let visible = true, raf = 0;
  const size = () => {
    const w = canvas.clientWidth || 1, h = canvas.clientHeight || 1;
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5)); renderer.setSize(w, h, false);
    cam.aspect = w / h; cam.updateProjectionMatrix(); gem.position.set(w < 800 ? 0.4 : 2, 0.1, -1);
  };
  const draw = (t) => {
    gem.rotation.set(t * 4e-5, t * 8e-5, 0); dust.rotation.y = t * 2e-5;
    cam.position.x += (m.x * 0.5 - cam.position.x) * 0.05; cam.position.y += (-m.y * 0.3 - cam.position.y) * 0.05;
    cam.lookAt(0, 0, 0); renderer.render(scene, cam);
  };
  const loop = (t) => { draw(t); raf = visible ? requestAnimationFrame(loop) : 0; };

  size(); addEventListener("resize", () => { size(); if (reduce) draw(0); });
  if (reduce) return draw(0); // reduced motion: one still frame
  addEventListener("pointermove", (e) => { m.x = e.clientX / innerWidth - 0.5; m.y = e.clientY / innerHeight - 0.5; }, { passive: true });
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible && !raf) raf = requestAnimationFrame(loop); }).observe(canvas);
}

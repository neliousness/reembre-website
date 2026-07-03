import * as THREE from 'three';

/* Minimal ambient backdrop: a sparse field of warm motes drifting in
   depth, plus one barely-there dashed perimeter ring rotating slowly.
   It adds air and motion without competing with the page content. */

function moteTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 64;
  const ctx = canvas.getContext('2d');
  const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  gradient.addColorStop(0, 'rgba(215, 114, 38, 0.9)');
  gradient.addColorStop(0.4, 'rgba(215, 114, 38, 0.35)');
  gradient.addColorStop(1, 'rgba(215, 114, 38, 0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 64, 64);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function createWorld(canvas, { reducedMotion = false } = {}) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 60);
  camera.position.z = 14;

  /* drifting motes */
  const COUNT = 110;
  const positions = new Float32Array(COUNT * 3);
  const speeds = new Float32Array(COUNT);
  for (let i = 0; i < COUNT; i += 1) {
    positions[i * 3] = (Math.random() - 0.5) * 34;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 12;
    speeds[i] = 0.12 + Math.random() * 0.3;
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const motes = new THREE.Points(
    geometry,
    new THREE.PointsMaterial({
      map: moteTexture(),
      size: 0.22,
      transparent: true,
      opacity: 0.5,
      depthWrite: false,
      sizeAttenuation: true,
    })
  );
  scene.add(motes);

  /* one faint dashed perimeter ring, far behind content */
  const ringPoints = [];
  for (let i = 0; i <= 160; i += 1) {
    const angle = (i / 160) * Math.PI * 2;
    ringPoints.push(new THREE.Vector3(Math.cos(angle) * 9.5, Math.sin(angle) * 9.5, 0));
  }
  const ringGeometry = new THREE.BufferGeometry().setFromPoints(ringPoints);
  const ring = new THREE.Line(
    ringGeometry,
    new THREE.LineDashedMaterial({
      color: 0xd77226,
      transparent: true,
      opacity: 0.14,
      dashSize: 0.42,
      gapSize: 0.34,
    })
  );
  ring.computeLineDistances();
  ring.position.set(5.5, -1.2, -6);
  scene.add(ring);

  /* pointer parallax */
  const mouse = { x: 0, y: 0, cx: 0, cy: 0 };
  window.addEventListener('pointermove', (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = (event.clientY / window.innerHeight) * 2 - 1;
  });

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  const clock = new THREE.Clock();
  function tick() {
    const t = reducedMotion ? 0 : clock.getElapsedTime();

    const pos = geometry.attributes.position;
    for (let i = 0; i < COUNT; i += 1) {
      pos.array[i * 3 + 1] += Math.sin(t * 0.4 + i) * 0.0009 + speeds[i] * 0.0016;
      if (pos.array[i * 3 + 1] > 10.5) pos.array[i * 3 + 1] = -10.5;
    }
    pos.needsUpdate = true;

    ring.rotation.z = t * 0.02;

    mouse.cx += (mouse.x - mouse.cx) * 0.03;
    mouse.cy += (mouse.y - mouse.cy) * 0.03;
    camera.position.x = mouse.cx * 0.5;
    camera.position.y = -mouse.cy * 0.3;
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
    if (!reducedMotion) requestAnimationFrame(tick);
  }
  tick();

  return {};
}

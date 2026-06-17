import { useEffect, useRef } from 'react';
import * as THREE from 'three';

type ParticleData = {
  radius: number;
  angle: number;
  layer: number;
  speed: number;
  drift: number;
  phase: number;
  softness: number;
};

type RingParticleData = {
  radius: number;
  angle: number;
  speed: number;
  wobble: number;
  phase: number;
};

const makeGlowTexture = (
  inner: string,
  outer: string,
  width = 512,
  height = 512,
  middle = outer,
) => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');

  if (!context) {
    return new THREE.CanvasTexture(canvas);
  }

  const gradient = context.createRadialGradient(
    width / 2,
    height / 2,
    0,
    width / 2,
    height / 2,
    Math.max(width, height) / 2,
  );
  gradient.addColorStop(0, inner);
  gradient.addColorStop(0.12, inner);
  gradient.addColorStop(0.38, middle);
  gradient.addColorStop(0.72, outer);
  gradient.addColorStop(1, 'rgba(255,255,255,0)');
  context.fillStyle = gradient;
  context.fillRect(0, 0, width, height);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
};

const makeLayeredHoleTexture = () => {
  const size = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext('2d');

  if (!context) {
    return new THREE.CanvasTexture(canvas);
  }

  const center = size / 2;
  const gradient = context.createRadialGradient(center, center, 0, center, center, center);
  gradient.addColorStop(0, 'rgba(255,255,255,1)');
  gradient.addColorStop(0.12, 'rgba(255,255,255,0.98)');
  gradient.addColorStop(0.24, 'rgba(255,216,224,0.78)');
  gradient.addColorStop(0.38, 'rgba(255,180,196,0.48)');
  gradient.addColorStop(0.54, 'rgba(164,177,196,0.38)');
  gradient.addColorStop(0.7, 'rgba(123,140,165,0.2)');
  gradient.addColorStop(0.84, 'rgba(255,135,105,0.26)');
  gradient.addColorStop(0.96, 'rgba(255,180,132,0.08)');
  gradient.addColorStop(1, 'rgba(255,255,255,0)');
  context.fillStyle = gradient;
  context.fillRect(0, 0, size, size);

  context.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 320; i += 1) {
    const angle = Math.random() * Math.PI * 2;
    const radius = Math.random() ** 0.72 * center * 0.9;
    const x = center + Math.cos(angle) * radius;
    const y = center + Math.sin(angle) * radius;
    const particleRadius = 0.9 + Math.random() * 2.8;
    const alpha = 0.018 + Math.random() * 0.05;
    context.beginPath();
    context.fillStyle = `rgba(255,255,255,${alpha})`;
    context.arc(x, y, particleRadius, 0, Math.PI * 2);
    context.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
};

export function OmphalosSpace() {
  const containerRef = useRef<HTMLDivElement>(null);
  const exploreTargetRef = useRef(0);
  const exploreRef = useRef(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0xdceaf6, 0.018);

    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 80);
    camera.position.set(0, 0.6, 13.5);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0xdceaf6, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 2.4));

    const centerLight = new THREE.PointLight(0xffffff, 8, 18, 1.8);
    centerLight.position.set(0, -0.1, 1.8);
    scene.add(centerLight);

    const warmLight = new THREE.PointLight(0xffb7a9, 4.5, 16, 2);
    warmLight.position.set(0, -0.15, 2.2);
    scene.add(warmLight);

    const veilTexture = makeGlowTexture(
      'rgba(255,255,255,0.62)',
      'rgba(255,255,255,0)',
      1024,
      1024,
      'rgba(255,226,220,0.22)',
    );
    const veilMaterial = new THREE.SpriteMaterial({
      map: veilTexture,
      transparent: true,
      opacity: 0.24,
      depthWrite: false,
      blending: THREE.NormalBlending,
    });
    const upperVeil = new THREE.Sprite(veilMaterial);
    upperVeil.scale.set(9.4, 5.2, 1);
    upperVeil.position.set(0, 1.02, -0.8);
    scene.add(upperVeil);

    const outerDomeGeometry = new THREE.SphereGeometry(4.6, 128, 128);
    const outerDomeMaterial = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.NormalBlending,
      uniforms: {
        time: { value: 0 },
      },
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vPosition;

        void main() {
          vNormal = normalize(normalMatrix * normal);
          vPosition = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        varying vec3 vNormal;
        varying vec3 vPosition;

        float grain(vec2 p) {
          return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
        }

        void main() {
          float rim = pow(1.0 - abs(vNormal.z), 1.42);
          float topFade = smoothstep(-2.7, 2.2, vPosition.y);
          float lowerFade = 1.0 - smoothstep(1.7, 3.3, abs(vPosition.y));
          float breath = 0.9 + 0.1 * sin(time * 0.65);
          float cloud = 0.94 + grain(vPosition.xy * 14.0 + time * 0.018) * 0.06;
          vec3 color = mix(vec3(0.82, 0.9, 1.0), vec3(1.0, 0.96, 0.95), topFade);
          float alpha = (0.08 + rim * 0.12 + topFade * 0.07) * lowerFade * breath * cloud;
          gl_FragColor = vec4(color, alpha);
        }
      `,
    });
    const outerDome = new THREE.Mesh(outerDomeGeometry, outerDomeMaterial);
    outerDome.scale.set(1.48, 0.72, 0.36);
    outerDome.position.set(0, 0.82, 0);
    scene.add(outerDome);

    const shadowDomeGeometry = new THREE.SphereGeometry(3.45, 128, 128);
    const shadowDomeMaterial = new THREE.MeshBasicMaterial({
      color: '#b4b4c4',
      transparent: true,
      opacity: 0.035,
      depthWrite: false,
      blending: THREE.MultiplyBlending,
    });
    const shadowDome = new THREE.Mesh(shadowDomeGeometry, shadowDomeMaterial);
    shadowDome.scale.set(1.34, 0.68, 0.28);
    shadowDome.position.set(0, 0.62, -0.16);
    scene.add(shadowDome);

    const coreAuraTexture = makeGlowTexture(
      'rgba(255,238,232,0.72)',
      'rgba(255,210,200,0)',
      768,
      768,
      'rgba(255,190,176,0.22)',
    );
    const coreAuraMaterial = new THREE.SpriteMaterial({
      map: coreAuraTexture,
      transparent: true,
      opacity: 0.22,
      depthWrite: false,
      blending: THREE.NormalBlending,
    });
    const coreAura = new THREE.Sprite(coreAuraMaterial);
    coreAura.scale.set(5.6, 3.6, 1);
    coreAura.position.set(0, -0.52, 0.35);
    scene.add(coreAura);

    const coreGeometry = new THREE.SphereGeometry(1.42, 128, 128);
    const coreMaterial = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.NormalBlending,
      uniforms: {
        time: { value: 0 },
      },
      vertexShader: `
        uniform float time;
        varying vec3 vNormal;
        varying vec3 vPosition;

        void main() {
          vNormal = normalize(normalMatrix * normal);
          vPosition = position;
          vec3 warped = position;
          warped.x += sin(position.y * 2.2 + time * 0.6) * 0.045;
          warped.y += cos(position.x * 2.6 + time * 0.48) * 0.035;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(warped, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        varying vec3 vNormal;
        varying vec3 vPosition;

        float grain(vec2 p) {
          return fract(sin(dot(p, vec2(269.5, 183.3))) * 24634.6345);
        }

        void main() {
          float rim = pow(1.0 - abs(vNormal.z), 1.65);
          float center = 1.0 - smoothstep(0.0, 1.62, length(vPosition.xy));
          float cloud = 0.5 + 0.5 * sin(vPosition.x * 1.6 + vPosition.y * 2.1 + time * 0.45);
          float pore = grain(vPosition.xy * 24.0 + time * 0.025) * 0.045;
          vec3 peach = vec3(1.0, 0.56, 0.48);
          vec3 milk = vec3(1.0, 0.9, 0.86);
          vec3 color = mix(peach, milk, center * 0.62 + cloud * 0.1 + pore);
          float alpha = 0.3 + center * 0.13 + rim * 0.18;
          gl_FragColor = vec4(color, alpha);
        }
      `,
    });
    const core = new THREE.Mesh(coreGeometry, coreMaterial);
    core.scale.set(1.48, 1.06, 0.45);
    core.position.set(0, -0.58, 1.15);
    scene.add(core);

    const yellowAuraTexture = makeGlowTexture(
      'rgba(255,255,246,0.9)',
      'rgba(255,229,146,0)',
      900,
      900,
      'rgba(255,244,197,0.34)',
    );
    const yellowAuraMaterial = new THREE.SpriteMaterial({
      map: yellowAuraTexture,
      transparent: true,
      opacity: 0.26,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const yellowAura = new THREE.Sprite(yellowAuraMaterial);
    yellowAura.scale.set(3.25, 3.25, 1);
    yellowAura.position.set(0, -0.62, 2.1);
    scene.add(yellowAura);

    const layeredHoleTexture = makeLayeredHoleTexture();
    const layeredHoleMaterial = new THREE.SpriteMaterial({
      map: layeredHoleTexture,
      transparent: true,
      opacity: 0.28,
      depthWrite: false,
      blending: THREE.NormalBlending,
    });
    const layeredHole = new THREE.Sprite(layeredHoleMaterial);
    layeredHole.scale.set(2.18, 2.18, 1);
    layeredHole.position.set(0, -0.62, 2.34);
    scene.add(layeredHole);

    const apertureTexture = makeGlowTexture(
      'rgba(255,255,255,1)',
      'rgba(255,255,255,0)',
      512,
      512,
      'rgba(255,255,248,0.62)',
    );
    const apertureMaterial = new THREE.SpriteMaterial({
      map: apertureTexture,
      transparent: true,
      opacity: 0.36,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const aperture = new THREE.Sprite(apertureMaterial);
    aperture.scale.set(0.66, 0.66, 1);
    aperture.position.set(0, -0.62, 2.48);
    scene.add(aperture);

    const flareTexture = makeGlowTexture(
      'rgba(255,255,255,0.9)',
      'rgba(255,220,198,0)',
      1024,
      256,
      'rgba(255,238,230,0.24)',
    );
    const flareMaterial = new THREE.SpriteMaterial({
      map: flareTexture,
      transparent: true,
      opacity: 0.16,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const horizontalFlare = new THREE.Sprite(flareMaterial);
    horizontalFlare.scale.set(6.8, 0.62, 1);
    horizontalFlare.position.set(0, -0.56, 2.15);
    scene.add(horizontalFlare);

    const particleTexture = makeGlowTexture(
      'rgba(255,255,255,0.82)',
      'rgba(255,255,255,0)',
      128,
      128,
      'rgba(255,229,222,0.26)',
    );

    const ringParticleCount = 2200;
    const ringPositions = new Float32Array(ringParticleCount * 3);
    const ringColors = new Float32Array(ringParticleCount * 3);
    const ringParticleData: RingParticleData[] = [];
    const ringPalette = [
      { color: new THREE.Color('#ffffff'), min: 0.18, max: 0.52 },
      { color: new THREE.Color('#ffd0db'), min: 0.48, max: 0.88 },
      { color: new THREE.Color('#8794aa'), min: 0.82, max: 1.34 },
      { color: new THREE.Color('#ff8f6f'), min: 1.2, max: 1.86 },
    ];

    for (let i = 0; i < ringParticleCount; i += 1) {
      const band = ringPalette[Math.floor((i / ringParticleCount) * ringPalette.length)];
      const radius = THREE.MathUtils.randFloat(band.min, band.max);
      const angle = Math.random() * Math.PI * 2;
      const speed = THREE.MathUtils.randFloat(0.0015, 0.005);
      const wobble = THREE.MathUtils.randFloat(0.012, 0.05);
      const phase = Math.random() * Math.PI * 2;
      const color = band.color.clone().lerp(new THREE.Color('#fff8df'), Math.random() * 0.16);

      ringParticleData.push({ radius, angle, speed, wobble, phase });
      ringPositions[i * 3] = Math.cos(angle) * radius;
      ringPositions[i * 3 + 1] = Math.sin(angle) * radius;
      ringPositions[i * 3 + 2] = THREE.MathUtils.randFloat(-0.04, 0.16);
      ringColors[i * 3] = color.r;
      ringColors[i * 3 + 1] = color.g;
      ringColors[i * 3 + 2] = color.b;
    }

    const ringParticleGeometry = new THREE.BufferGeometry();
    ringParticleGeometry.setAttribute('position', new THREE.BufferAttribute(ringPositions, 3));
    ringParticleGeometry.setAttribute('color', new THREE.BufferAttribute(ringColors, 3));
    const ringParticleMaterial = new THREE.PointsMaterial({
      size: 0.055,
      map: particleTexture,
      vertexColors: true,
      transparent: true,
      opacity: 0.3,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true,
    });
    const ringParticles = new THREE.Points(ringParticleGeometry, ringParticleMaterial);
    ringParticles.position.set(0, -0.62, 2.5);
    scene.add(ringParticles);

    const galaxyParticleCount = 1700;
    const galaxyPositions = new Float32Array(galaxyParticleCount * 3);
    const galaxyColors = new Float32Array(galaxyParticleCount * 3);
    const galaxyParticleData: RingParticleData[] = [];
    const galaxyPalette = [
      new THREE.Color('#fffef4'),
      new THREE.Color('#fff0b8'),
      new THREE.Color('#ffd2c6'),
      new THREE.Color('#aeb9cc'),
    ];

    for (let i = 0; i < galaxyParticleCount; i += 1) {
      const angle = Math.random() * Math.PI * 2;
      const radius = THREE.MathUtils.randFloat(0.58, 3.25);
      const speed = THREE.MathUtils.randFloat(0.0008, 0.0024);
      const wobble = THREE.MathUtils.randFloat(0.025, 0.09);
      const phase = Math.random() * Math.PI * 2;
      const color = galaxyPalette[Math.floor(Math.random() * galaxyPalette.length)];

      galaxyParticleData.push({ radius, angle, speed, wobble, phase });
      galaxyPositions[i * 3] = Math.cos(angle) * radius * 1.65;
      galaxyPositions[i * 3 + 1] = Math.sin(angle) * radius * 0.16;
      galaxyPositions[i * 3 + 2] = Math.sin(angle) * radius * 0.34;
      galaxyColors[i * 3] = color.r;
      galaxyColors[i * 3 + 1] = color.g;
      galaxyColors[i * 3 + 2] = color.b;
    }

    const galaxyGeometry = new THREE.BufferGeometry();
    galaxyGeometry.setAttribute('position', new THREE.BufferAttribute(galaxyPositions, 3));
    galaxyGeometry.setAttribute('color', new THREE.BufferAttribute(galaxyColors, 3));
    const galaxyMaterial = new THREE.PointsMaterial({
      size: 0.072,
      map: particleTexture,
      vertexColors: true,
      transparent: true,
      opacity: 0.36,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true,
    });
    const galaxyRing = new THREE.Points(galaxyGeometry, galaxyMaterial);
    galaxyRing.position.set(0, -0.58, 2.56);
    galaxyRing.rotation.x = -0.18;
    galaxyRing.rotation.z = 0.04;
    scene.add(galaxyRing);

    const particleCount = 4200;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const particleData: ParticleData[] = [];
    const palette = [
      new THREE.Color('#ffffff'),
      new THREE.Color('#fff2ec'),
      new THREE.Color('#ffd8cc'),
      new THREE.Color('#cfd6e8'),
    ];

    for (let i = 0; i < particleCount; i += 1) {
      const radius = THREE.MathUtils.randFloat(1.2, 5.8);
      const angle = Math.random() * Math.PI * 2;
      const layer = Math.random();
      const speed = THREE.MathUtils.randFloat(0.0009, 0.0035);
      const drift = THREE.MathUtils.randFloat(0.0007, 0.0028);
      const phase = Math.random() * Math.PI * 2;
      const softness = THREE.MathUtils.randFloat(0.55, 1.35);
      const color = palette[Math.floor(Math.random() * palette.length)];

      particleData.push({ radius, angle, layer, speed, drift, phase, softness });
      positions[i * 3] = Math.cos(angle) * radius * 1.18;
      positions[i * 3 + 1] = Math.sin(angle) * radius * 0.52 + 0.25;
      positions[i * 3 + 2] = THREE.MathUtils.lerp(-0.7, 1.7, layer);
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }

    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particleMaterial = new THREE.PointsMaterial({
      size: 0.105,
      map: particleTexture,
      vertexColors: true,
      transparent: true,
      opacity: 0.18,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true,
    });
    const particleMist = new THREE.Points(particleGeometry, particleMaterial);
    particleMist.position.set(0, 0.05, 0.85);
    scene.add(particleMist);

    const farMistGeometry = particleGeometry.clone();
    const farMistMaterial = new THREE.PointsMaterial({
      size: 0.19,
      map: particleTexture,
      vertexColors: true,
      transparent: true,
      opacity: 0.06,
      blending: THREE.NormalBlending,
      depthWrite: false,
      sizeAttenuation: true,
    });
    const farMist = new THREE.Points(farMistGeometry, farMistMaterial);
    farMist.scale.set(1.16, 1.08, 1);
    farMist.position.set(0, 0.1, 0.12);
    scene.add(farMist);

    const clock = new THREE.Clock();
    let animationFrame = 0;
    let isMobile = false;

    const resize = () => {
      const width = container.clientWidth;
      const height = container.clientHeight;
      isMobile = width < 720;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    };

    const updateExploreTarget = (delta: number) => {
      exploreTargetRef.current = THREE.MathUtils.clamp(
        exploreTargetRef.current + delta,
        0,
        1,
      );
    };

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      updateExploreTarget(event.deltaY * 0.00115);
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return;
      const bounds = container.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / bounds.width - 0.5;
      const y = (event.clientY - bounds.top) / bounds.height - 0.5;
      camera.rotation.y = THREE.MathUtils.lerp(camera.rotation.y, x * 0.035, 0.08);
      camera.rotation.x = THREE.MathUtils.lerp(camera.rotation.x, -y * 0.025, 0.08);
    };

    const animate = () => {
      const elapsed = clock.getElapsedTime();
      exploreRef.current += (exploreTargetRef.current - exploreRef.current) * 0.07;
      const explore = exploreRef.current;
      const baseCameraZ = isMobile ? 13.2 : 11.2;
      const baseCameraY = isMobile ? 0.18 : 0.36;
      const zoomCurve = explore * explore * (3 - 2 * explore);
      const flowBoost = 1 + zoomCurve * 2.6;
      const positionAttribute = particleGeometry.getAttribute('position') as THREE.BufferAttribute;

      for (let i = 0; i < particleCount; i += 1) {
        const data = particleData[i];
        data.radius -= data.speed * flowBoost;
        data.angle += data.drift * (1 + zoomCurve * 1.15);

        if (data.radius < 0.72) {
          data.radius = THREE.MathUtils.randFloat(4.0, 6.3);
          data.layer = Math.random();
        }

        const ripple = Math.sin(elapsed * 0.28 + data.phase) * 0.12 * data.softness;
        const lateral = Math.sin(elapsed * 0.17 + data.phase * 1.7) * 0.055 * data.softness;
        const pull = 1 - zoomCurve * 0.28;
        const ovalX = Math.cos(data.angle) * data.radius * (1.18 + lateral) * pull;
        const ovalY = Math.sin(data.angle) * data.radius * 0.49 * pull + 0.18 + ripple;
        const domeLift = Math.max(0, 1 - data.radius / 6.2) * (0.35 + zoomCurve * 0.22);

        positionAttribute.setXYZ(
          i,
          ovalX,
          ovalY + domeLift - zoomCurve * 0.16,
          THREE.MathUtils.lerp(-0.72, 1.72 + zoomCurve * 1.15, data.layer),
        );
      }

      positionAttribute.needsUpdate = true;
      const ringPositionAttribute = ringParticleGeometry.getAttribute('position') as THREE.BufferAttribute;
      const galaxyPositionAttribute = galaxyGeometry.getAttribute('position') as THREE.BufferAttribute;

      for (let i = 0; i < ringParticleCount; i += 1) {
        const data = ringParticleData[i];
        data.angle += data.speed * (1 + zoomCurve * 1.4);
        const haze = Math.sin(elapsed * 0.36 + data.phase) * data.wobble;
        const radius = data.radius + haze;

        ringPositionAttribute.setXYZ(
          i,
          Math.cos(data.angle) * radius,
          Math.sin(data.angle) * radius,
          Math.sin(data.angle * 2.0 + elapsed * 0.24 + data.phase) * 0.045,
        );
      }

      for (let i = 0; i < galaxyParticleCount; i += 1) {
        const data = galaxyParticleData[i];
        data.angle += data.speed * (1 + zoomCurve * 1.8);
        const shimmer = Math.sin(elapsed * 0.42 + data.phase) * data.wobble;
        const radius = data.radius + shimmer;

        galaxyPositionAttribute.setXYZ(
          i,
          Math.cos(data.angle) * radius * 1.65,
          Math.sin(data.angle) * radius * (0.14 + zoomCurve * 0.035),
          Math.sin(data.angle) * radius * 0.34 + Math.cos(data.angle * 1.7 + elapsed * 0.22) * 0.055,
        );
      }

      ringPositionAttribute.needsUpdate = true;
      galaxyPositionAttribute.needsUpdate = true;
      camera.position.z = THREE.MathUtils.lerp(baseCameraZ, isMobile ? 8.3 : 6.8, zoomCurve);
      camera.position.y = THREE.MathUtils.lerp(baseCameraY, isMobile ? -0.38 : -0.52, zoomCurve);
      camera.fov = THREE.MathUtils.lerp(42, isMobile ? 49 : 46, zoomCurve);
      camera.lookAt(0, THREE.MathUtils.lerp(-0.28, -0.58, zoomCurve), 1.15);
      camera.updateProjectionMatrix();

      particleMist.rotation.z = Math.sin(elapsed * 0.16) * (0.018 + zoomCurve * 0.025);
      particleMist.rotation.y = elapsed * (0.018 + zoomCurve * 0.048);
      particleMist.scale.setScalar(1 + zoomCurve * 0.2);
      farMist.rotation.z = Math.sin(elapsed * 0.11) * (-0.014 - zoomCurve * 0.018);
      farMist.rotation.y = -elapsed * (0.01 + zoomCurve * 0.032);
      farMist.scale.set(1.16 + zoomCurve * 0.42, 1.08 + zoomCurve * 0.25, 1);
      particleMaterial.opacity = 0.18 + zoomCurve * 0.18;
      farMistMaterial.opacity = 0.06 + zoomCurve * 0.08;

      outerDomeMaterial.uniforms.time.value = elapsed;
      coreMaterial.uniforms.time.value = elapsed;
      outerDome.position.y = (isMobile ? 1.25 : 0.82) + zoomCurve * 0.16;
      shadowDome.position.y = (isMobile ? 1.0 : 0.62) + zoomCurve * 0.08;
      upperVeil.position.y = (isMobile ? 1.35 : 1.02) - zoomCurve * 0.22;
      outerDome.scale.set(1.48 + zoomCurve * 0.28, 0.72 + zoomCurve * 0.08, 0.36);
      shadowDome.scale.set(1.34 + zoomCurve * 0.18, 0.68 + zoomCurve * 0.05, 0.28);
      core.scale.set(
        1.48 + zoomCurve * 0.54 + Math.sin(elapsed * 0.72) * 0.025,
        1.06 + zoomCurve * 0.38 + Math.cos(elapsed * 0.64) * 0.022,
        0.45,
      );
      upperVeil.scale.set(9.4 + zoomCurve * 1.5 + Math.sin(elapsed * 0.32) * 0.18, 5.2 + zoomCurve * 0.6, 1);
      coreAura.scale.set(5.6 + zoomCurve * 1.9 + Math.sin(elapsed * 0.52) * 0.14, 3.6 + zoomCurve * 1.1, 1);
      coreAuraMaterial.opacity = 0.22 + zoomCurve * 0.12;
      veilMaterial.opacity = 0.24 - zoomCurve * 0.08;
      const aperturePulse = 0.66 + zoomCurve * 0.24 + Math.sin(elapsed * 1.05) * 0.018;
      const layeredPulse = 2.18 + zoomCurve * 0.66 + Math.sin(elapsed * 0.78) * 0.04;
      const auraPulse = 3.25 + zoomCurve * 1.2 + Math.sin(elapsed * 0.62) * 0.12;
      yellowAura.scale.set(auraPulse, auraPulse, 1);
      yellowAuraMaterial.opacity = 0.26 + zoomCurve * 0.16;
      layeredHole.scale.set(layeredPulse, layeredPulse, 1);
      layeredHoleMaterial.opacity = 0.28 + zoomCurve * 0.2;
      layeredHoleMaterial.rotation = elapsed * 0.025;
      aperture.scale.set(aperturePulse, aperturePulse, 1);
      ringParticles.scale.setScalar(1 + zoomCurve * 0.25);
      ringParticles.rotation.z = elapsed * 0.045;
      ringParticleMaterial.opacity = 0.3 + zoomCurve * 0.24;
      galaxyRing.scale.set(1 + zoomCurve * 0.32, 1 + zoomCurve * 0.18, 1);
      galaxyRing.rotation.z = 0.04 + Math.sin(elapsed * 0.2) * 0.025;
      galaxyRing.rotation.y = Math.sin(elapsed * 0.18) * 0.06;
      galaxyMaterial.opacity = 0.36 + zoomCurve * 0.26;
      horizontalFlare.scale.set(6.8 + zoomCurve * 2.1 + Math.sin(elapsed * 0.8) * 0.18, 0.62 + zoomCurve * 0.18, 1);
      centerLight.intensity = 7.4 + zoomCurve * 3.2 + Math.sin(elapsed * 1.1) * 0.8;
      warmLight.intensity = 4.5 + zoomCurve * 1.8;

      renderer.render(scene, camera);
      animationFrame = window.requestAnimationFrame(animate);
    };

    resize();
    animate();
    window.addEventListener('resize', resize);
    window.addEventListener('wheel', handleWheel, { passive: false });
    container.addEventListener('pointermove', handlePointerMove);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener('resize', resize);
      window.removeEventListener('wheel', handleWheel);
      container.removeEventListener('pointermove', handlePointerMove);
      container.removeChild(renderer.domElement);
      outerDomeGeometry.dispose();
      outerDomeMaterial.dispose();
      shadowDomeGeometry.dispose();
      shadowDomeMaterial.dispose();
      veilTexture.dispose();
      veilMaterial.dispose();
      coreAuraTexture.dispose();
      coreAuraMaterial.dispose();
      coreGeometry.dispose();
      coreMaterial.dispose();
      yellowAuraTexture.dispose();
      yellowAuraMaterial.dispose();
      layeredHoleTexture.dispose();
      layeredHoleMaterial.dispose();
      apertureTexture.dispose();
      apertureMaterial.dispose();
      flareTexture.dispose();
      flareMaterial.dispose();
      ringParticleGeometry.dispose();
      ringParticleMaterial.dispose();
      galaxyGeometry.dispose();
      galaxyMaterial.dispose();
      particleGeometry.dispose();
      particleMaterial.dispose();
      farMistGeometry.dispose();
      farMistMaterial.dispose();
      particleTexture.dispose();
      renderer.dispose();
    };
  }, []);

  return <div className="space-canvas" ref={containerRef} aria-hidden="true" />;
}

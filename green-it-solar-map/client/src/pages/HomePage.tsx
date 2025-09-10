import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { gsap } from 'gsap';

// --- Shaders for the atmospheric glow ---
const vertexShader = `
  varying vec3 vertexNormal;
  void main() {
    vertexNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  varying vec3 vertexNormal;
  void main() {
    float intensity = pow(0.6 - dot(vertexNormal, vec3(0, 0, 1.0)), 2.0);
    gl_FragColor = vec4(0.3, 0.6, 1.0, 1.0) * intensity;
  }
`;
// -----------------------------------------

// Define an interface for our coordinates
interface Coordinates {
  lat: number;
  lng: number;
}

const HomePage = () => {
  const [target, setTarget] = useState<Coordinates | null>(null);
  const mountRef = useRef<HTMLDivElement>(null);

  const handleFlyTo = () => {
    setTarget({ lat: 18.4582, lng: 73.8507 }); // VIT Pune coordinates
  };

  useEffect(() => {
    if (!mountRef.current) return;
    const currentMount = mountRef.current;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, currentMount.clientWidth / currentMount.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    currentMount.appendChild(renderer.domElement);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    // Earth Sphere
    const textureLoader = new THREE.TextureLoader();
    const earthGeometry = new THREE.SphereGeometry(2, 64, 64);
    const earthMaterial = new THREE.MeshStandardMaterial({
      map: textureLoader.load('https://unpkg.com/three-globe/example/img/earth-day.jpg'), // <-- RELIABLE TEXTURE URL
    });
    const earth = new THREE.Mesh(earthGeometry, earthMaterial);
    scene.add(earth);

    // Atmosphere Sphere
    const atmosphereGeometry = new THREE.SphereGeometry(2, 64, 64);
    const atmosphereMaterial = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
    });
    const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
    atmosphere.scale.set(1.1, 1.1, 1.1);
    scene.add(atmosphere);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    camera.position.z = 5;

    // Fly-to Animation Logic
    if (target) {
      const { lat, lng } = target;
      const radius = 2;
      const phi = (90 - lat) * (Math.PI / 180);
      const theta = (lng + 180) * (Math.PI / 180);
      const targetPosition = new THREE.Vector3(
        -radius * Math.sin(phi) * Math.cos(theta),
        radius * Math.cos(phi),
        radius * Math.sin(phi) * Math.sin(theta)
      );

      gsap.to(camera.position, {
        duration: 2.5,
        x: targetPosition.x * 2.2, // Zoom closer
        y: targetPosition.y * 2.2,
        z: targetPosition.z * 2.2,
        onUpdate: () => camera.lookAt(earth.position),
      });
    }

    // Animation Loop
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Handle Resize
    const handleResize = () => {
      camera.aspect = currentMount.clientWidth / currentMount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (currentMount) {
        currentMount.removeChild(renderer.domElement);
      }
    };
  }, [target]);

  const containerStyle: React.CSSProperties = {
    width: '100%',
    height: '90vh',
    backgroundColor: '#000',
  };

  const uiContainerStyle: React.CSSProperties = {
    position: 'absolute',
    top: '80px', // Adjusted to not overlap header
    left: '20px',
    zIndex: 10,
    background: 'rgba(255, 255, 255, 0.8)',
    padding: '10px',
    borderRadius: '5px',
  };

  return (
    <div style={containerStyle}>
      <div style={uiContainerStyle}>
        <input type="text" placeholder="e.g., VIT Pune" style={{ marginRight: '10px' }} />
        <button onClick={handleFlyTo}>Fly to Location</button>
      </div>
      <div ref={mountRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
};

export default HomePage;
import { useRef, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, MeshTransmissionMaterial } from "@react-three/drei";
import * as THREE from "three";

function HeartMesh() {
  const meshRef = useRef<THREE.Mesh>(null!);

  // Build heart shape using standard heart parametric curve
  const heartShape = new THREE.Shape();
  const scale = 1.1;

  heartShape.moveTo(0, 0.4 * scale);
  heartShape.bezierCurveTo(
    0, 0.8 * scale,
    -0.5 * scale, 1.0 * scale,
    -1.0 * scale, 0.6 * scale
  );
  heartShape.bezierCurveTo(
    -1.5 * scale, 0.2 * scale,
    -1.5 * scale, -0.4 * scale,
    -1.0 * scale, -0.8 * scale
  );
  heartShape.bezierCurveTo(
    -0.6 * scale, -1.2 * scale,
    0, -1.4 * scale,
    0, -1.6 * scale
  );
  heartShape.bezierCurveTo(
    0, -1.4 * scale,
    0.6 * scale, -1.2 * scale,
    1.0 * scale, -0.8 * scale
  );
  heartShape.bezierCurveTo(
    1.5 * scale, -0.4 * scale,
    1.5 * scale, 0.2 * scale,
    1.0 * scale, 0.6 * scale
  );
  heartShape.bezierCurveTo(
    0.5 * scale, 1.0 * scale,
    0, 0.8 * scale,
    0, 0.4 * scale
  );

  const extrudeSettings: THREE.ExtrudeGeometryOptions = {
    depth: 0.7,
    bevelEnabled: true,
    bevelSegments: 12,
    steps: 3,
    bevelSize: 0.28,
    bevelThickness: 0.28,
  };

  const geometry = new THREE.ExtrudeGeometry(heartShape, extrudeSettings);
  geometry.center();

  // Slow rotation animation
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    meshRef.current.rotation.y = Math.sin(t * 0.4) * 0.5;
    meshRef.current.rotation.z = Math.sin(t * 0.25) * 0.08;
    meshRef.current.position.y = Math.sin(t * 0.6) * 0.08;
  });

  return (
    <mesh ref={meshRef} geometry={geometry} castShadow receiveShadow>
      <meshStandardMaterial
        color="#7c3aed"
        roughness={0.25}
        metalness={0.15}
        envMapIntensity={1.2}
        emissive="#3b0764"
        emissiveIntensity={0.25}
      />
    </mesh>
  );
}

export default function Heart3D() {
  return (
    <div className="heart3d-root">
      <Canvas
        camera={{ position: [0, 0, 5.5], fov: 42 }}
        gl={{ alpha: true, antialias: true }}
        style={{ background: "transparent" }}
        shadows
      >
        {/* Lighting for realistic depth */}
        <ambientLight intensity={0.4} />
        <directionalLight
          position={[-4, 6, 4]}
          intensity={2.5}
          color="#c4b5fd"
          castShadow
        />
        <directionalLight
          position={[4, -2, 2]}
          intensity={0.8}
          color="#7c6aff"
        />
        <pointLight position={[0, 4, 3]} intensity={1.5} color="#ddd6fe" />
        <pointLight position={[-3, -2, 2]} intensity={0.6} color="#4c1d95" />

        {/* Subtle purple rim light from behind */}
        <pointLight position={[0, 0, -4]} intensity={1.2} color="#7c6aff" />

        <Suspense fallback={null}>
          <Environment preset="city" />
          <HeartMesh />
        </Suspense>
      </Canvas>

      {/* CSS glow behind the canvas */}
      <div className="heart3d-glow heart3d-glow-1" />
      <div className="heart3d-glow heart3d-glow-2" />

      {/* Floating particles */}
      {[...Array(8)].map((_, i) => (
        <div key={i} className={`heart3d-particle heart3d-particle-${i + 1}`} />
      ))}
    </div>
  );
}

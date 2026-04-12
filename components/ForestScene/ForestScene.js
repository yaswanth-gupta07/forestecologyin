import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

const SEASON_SCENE = {
  summer: {
    background: "#0D2018",
    canopyA: "#3E5F3C",
    canopyB: "#4C7448",
    fog: "#1D3328",
    sun: "#FFD899",
    ray: "#FFE8B7",
    mistOpacity: 0.08,
    pollenCount: 750,
    rain: false,
    birdSpeed: 0.43,
  },
  monsoon: {
    background: "#0B231D",
    canopyA: "#1C5A3F",
    canopyB: "#2D7A55",
    fog: "#1B3A2F",
    sun: "#DCEBD8",
    ray: "#D7F2DF",
    mistOpacity: 0.14,
    pollenCount: 420,
    rain: true,
    birdSpeed: 0.36,
  },
  winter: {
    background: "#0C1A1D",
    canopyA: "#2D4A42",
    canopyB: "#355850",
    fog: "#21373D",
    sun: "#D7ECF7",
    ray: "#D2E7F5",
    mistOpacity: 0.18,
    pollenCount: 340,
    rain: false,
    birdSpeed: 0.3,
  },
};

const TRUNK = "#3B2A1F";

function seededNoise(seed) {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453123;
  return x - Math.floor(x);
}

function CinematicCameraRig() {
  useFrame(({ camera, clock }, delta) => {
    const t = clock.getElapsedTime();
    camera.position.z -= delta * 0.32;
    camera.position.x = Math.sin(t * 0.09) * 0.65;
    camera.position.y = 2.6 + Math.sin(t * 0.22) * 0.1;

    if (camera.position.z < -10) {
      camera.position.z = 10;
    }

    camera.lookAt(0, 2, -18);
  });

  return null;
}

function ForestTrees({ seasonConfig }) {
  const trunkRef = useRef(null);
  const canopyRef = useRef(null);
  const tempObject = useMemo(() => new THREE.Object3D(), []);
  const count = 150;

  const transforms = useMemo(
    () =>
      Array.from({ length: count }, (_, index) => {
        const radius = 5 + seededNoise(index * 17 + 1) * 24;
        const theta = seededNoise(index * 19 + 2) * Math.PI * 2;
        const x = Math.cos(theta) * radius;
        const z = -seededNoise(index * 23 + 3) * 55 - 2;
        const y = 1.25;
        const scaleY = 0.9 + seededNoise(index * 29 + 4) * 1.35;
        const canopyScale = 0.95 + seededNoise(index * 31 + 5) * 1.5;

        return {
          position: [x, y, z],
          rotationY: seededNoise(index * 37 + 6) * Math.PI,
          trunkScale: [0.72, scaleY, 0.72],
          canopyOffset: [x, y + 1.7 * scaleY, z],
          canopyScale: [canopyScale * 1.1, canopyScale, canopyScale * 1.1],
        };
      }),
    []
  );

  useEffect(() => {
    if (!trunkRef.current || !canopyRef.current) return;

    transforms.forEach((transform, index) => {
      tempObject.position.set(...transform.position);
      tempObject.rotation.set(0, transform.rotationY, 0);
      tempObject.scale.set(...transform.trunkScale);
      tempObject.updateMatrix();
      trunkRef.current.setMatrixAt(index, tempObject.matrix);

      tempObject.position.set(...transform.canopyOffset);
      tempObject.rotation.set(0, transform.rotationY * 0.5, 0);
      tempObject.scale.set(...transform.canopyScale);
      tempObject.updateMatrix();
      canopyRef.current.setMatrixAt(index, tempObject.matrix);
    });

    trunkRef.current.instanceMatrix.needsUpdate = true;
    canopyRef.current.instanceMatrix.needsUpdate = true;
  }, [tempObject, transforms]);

  return (
    <>
      <instancedMesh
        ref={trunkRef}
        args={[null, null, count]}
        castShadow
        receiveShadow
        frustumCulled={false}
      >
        <cylinderGeometry args={[0.13, 0.16, 2.45, 7]} />
        <meshStandardMaterial color={TRUNK} roughness={0.95} />
      </instancedMesh>
      <instancedMesh ref={canopyRef} args={[null, null, count]} castShadow frustumCulled={false}>
        <sphereGeometry args={[0.9, 7, 7]} />
        <meshStandardMaterial color={seasonConfig.canopyA} roughness={0.9} />
      </instancedMesh>
    </>
  );
}

function Ground({ seasonConfig }) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, -20]} receiveShadow>
      <planeGeometry args={[190, 190, 1, 1]} />
      <meshStandardMaterial color={seasonConfig.canopyB} roughness={1} metalness={0.02} />
    </mesh>
  );
}

function PollenParticles({ seasonConfig }) {
  const pointsRef = useRef(null);
  const count = seasonConfig.pollenCount;

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i += 1) {
      arr[i * 3] = (seededNoise(i * 11 + 7) - 0.5) * 42;
      arr[i * 3 + 1] = seededNoise(i * 13 + 8) * 11;
      arr[i * 3 + 2] = -seededNoise(i * 17 + 9) * 55 + 3;
    }
    return arr;
  }, [count]);

  useFrame(({ clock }) => {
    if (!pointsRef.current) return;
    const t = clock.getElapsedTime();
    pointsRef.current.rotation.y = t * 0.018;
    pointsRef.current.position.y = Math.sin(t * 0.18) * 0.3;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        color={seasonConfig.rain ? "#B4D7C5" : "#95D5B2"}
        size={0.06}
        transparent
        opacity={seasonConfig.rain ? 0.35 : 0.58}
        depthWrite={false}
        sizeAttenuation
      />
    </points>
  );
}

function RainParticles() {
  const pointsRef = useRef(null);
  const count = 800;

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i += 1) {
      arr[i * 3] = (seededNoise(i * 43 + 4) - 0.5) * 36;
      arr[i * 3 + 1] = seededNoise(i * 47 + 5) * 12;
      arr[i * 3 + 2] = -seededNoise(i * 53 + 6) * 50 + 2;
    }
    return arr;
  }, []);

  useFrame(() => {
    if (!pointsRef.current) return;
    const attr = pointsRef.current.geometry.attributes.position;
    const buffer = attr.array;

    for (let i = 0; i < count; i += 1) {
      const yIndex = i * 3 + 1;
      buffer[yIndex] -= 0.12;
      if (buffer[yIndex] < 0.25) {
        buffer[yIndex] = 10 + seededNoise(i * 59 + 7) * 2;
      }
    }

    attr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial color="#C5E7DB" size={0.04} opacity={0.45} transparent depthWrite={false} />
    </points>
  );
}

function MistBands({ seasonConfig }) {
  const groupRef = useRef(null);
  const bands = useMemo(
    () => [
      { y: 1.0, z: -9, scale: [26, 3.4, 1], speed: 0.06 },
      { y: 1.25, z: -20, scale: [34, 3.7, 1], speed: 0.04 },
      { y: 1.52, z: -32, scale: [40, 3.9, 1], speed: 0.03 },
    ],
    []
  );

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();
    groupRef.current.children.forEach((child, index) => {
      child.position.x = Math.sin(t * bands[index].speed + index) * 1.8;
      child.material.opacity =
        seasonConfig.mistOpacity + Math.sin(t * bands[index].speed + index) * 0.02;
    });
  });

  return (
    <group ref={groupRef}>
      {bands.map((band, index) => (
        <mesh key={index} position={[0, band.y, band.z]} scale={band.scale}>
          <planeGeometry args={[1, 1]} />
          <meshBasicMaterial
            color="#D5EFE0"
            transparent
            opacity={seasonConfig.mistOpacity}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      ))}
    </group>
  );
}

function LightRays({ seasonConfig }) {
  const groupRef = useRef(null);
  const rays = useMemo(
    () => [
      { x: -6.2, y: 6, z: -14, rot: 0.25, w: 1.6, h: 22 },
      { x: -2.1, y: 6.2, z: -19, rot: 0.2, w: 2.0, h: 26 },
      { x: 3.2, y: 6.4, z: -24, rot: 0.22, w: 2.25, h: 30 },
      { x: 7, y: 6.1, z: -29, rot: 0.17, w: 2.45, h: 32 },
    ],
    []
  );

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();
    groupRef.current.children.forEach((ray, index) => {
      ray.rotation.z = rays[index].rot + Math.sin(t * 0.18 + index) * 0.018;
      ray.material.opacity = 0.1 + Math.sin(t * 0.3 + index) * 0.018;
    });
  });

  return (
    <group ref={groupRef}>
      {rays.map((ray, index) => (
        <mesh key={index} position={[ray.x, ray.y, ray.z]} rotation={[0, 0, ray.rot]}>
          <planeGeometry args={[ray.w, ray.h]} />
          <meshBasicMaterial
            color={seasonConfig.ray}
            transparent
            opacity={0.12}
            depthWrite={false}
            side={THREE.DoubleSide}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      ))}
    </group>
  );
}

function Bird({ offset = 0, speed = 0.4, height = 6, depth = -16 }) {
  const groupRef = useRef(null);
  const leftWingRef = useRef(null);
  const rightWingRef = useRef(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * speed + offset;
    if (!groupRef.current || !leftWingRef.current || !rightWingRef.current) return;

    const active = Math.sin(clock.getElapsedTime() * 0.18 + offset) > -0.22;
    groupRef.current.visible = active;
    if (!active) return;

    groupRef.current.position.x = ((t * 4) % 44) - 22;
    groupRef.current.position.y = height + Math.sin(t * 1.65) * 0.2;
    groupRef.current.position.z = depth + Math.cos(t * 1.24) * 1.2;

    const flap = Math.sin(t * 8.8) * 0.48;
    leftWingRef.current.rotation.z = flap;
    rightWingRef.current.rotation.z = -flap;
  });

  return (
    <group ref={groupRef}>
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.06, 6, 6]} />
        <meshStandardMaterial color="#0E1813" />
      </mesh>
      <mesh ref={leftWingRef} position={[-0.11, 0, 0]}>
        <boxGeometry args={[0.2, 0.014, 0.08]} />
        <meshStandardMaterial color="#0E1813" />
      </mesh>
      <mesh ref={rightWingRef} position={[0.11, 0, 0]}>
        <boxGeometry args={[0.2, 0.014, 0.08]} />
        <meshStandardMaterial color="#0E1813" />
      </mesh>
    </group>
  );
}

function BirdFlock({ seasonConfig }) {
  return (
    <group>
      <Bird offset={0.2} speed={seasonConfig.birdSpeed} height={6.3} depth={-14} />
      <Bird offset={2.7} speed={seasonConfig.birdSpeed * 0.92} height={6.9} depth={-19} />
      <Bird offset={5.1} speed={seasonConfig.birdSpeed * 1.04} height={6.1} depth={-23} />
    </group>
  );
}

function ForestWorld({ seasonConfig }) {
  return (
    <>
      <color attach="background" args={[seasonConfig.background]} />
      <fog attach="fog" args={[seasonConfig.fog, 8, 44]} />

      <ambientLight intensity={0.4} />
      <hemisphereLight args={["#E4F5CA", "#122D20", 0.56]} />
      <directionalLight
        position={[-12, 16, 8]}
        intensity={1.16}
        castShadow
        color={seasonConfig.sun}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />

      <mesh position={[-13, 10, -24]}>
        <sphereGeometry args={[1.2, 18, 18]} />
        <meshBasicMaterial color={seasonConfig.sun} transparent opacity={0.2} />
      </mesh>

      <Ground seasonConfig={seasonConfig} />
      <ForestTrees seasonConfig={seasonConfig} />
      <LightRays seasonConfig={seasonConfig} />
      <MistBands seasonConfig={seasonConfig} />
      <PollenParticles seasonConfig={seasonConfig} />
      {seasonConfig.rain ? <RainParticles /> : null}
      <BirdFlock seasonConfig={seasonConfig} />
      <CinematicCameraRig />
    </>
  );
}

export default function ForestScene({ season = "summer" }) {
  const seasonConfig = SEASON_SCENE[season] || SEASON_SCENE.summer;

  return (
    <Canvas
      camera={{ position: [0, 2.5, 10], fov: 52, near: 0.1, far: 100 }}
      shadows
      dpr={[1, 1.5]}
      gl={{ antialias: false, powerPreference: "high-performance" }}
      performance={{ min: 0.5 }}
    >
      <ForestWorld seasonConfig={seasonConfig} />
    </Canvas>
  );
}

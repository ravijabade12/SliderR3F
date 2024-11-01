import React, { Suspense, useState, useEffect } from "react";
import { Canvas, useLoader, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef } from "react";

const models = [
  {
    name: "Laptop",
    path: "../laptop.glb",
    cameraPosition: [0, 0.5, 0.5],
  },
  {
    name: "Drone",
    path: "../drone.glb",
    cameraPosition: [0, 0.1, 0.3],
  },
  {
    name: "Headset",
    path: "../headset1.glb",
    cameraPosition: [0, 0, 40],
  },
  {
    name: "Wooden Box",
    path: "../wooden_box.glb",
    cameraPosition: [0, 2, 5],
  },
  {
    name: "VR",
    path: "../vr.glb",
    cameraPosition: [0, 0, 2.5],
  },
];

function Model({ modelPath, onLoad }) {
  const gltf = useLoader(GLTFLoader, modelPath);
  const modelRef = useRef();

  useEffect(() => {
    if (gltf) {
      onLoad();
    }
  }, [gltf, onLoad]);

  useFrame((state, delta) => {
    if (modelRef.current) {
      modelRef.current.rotation.y += delta * 0.5;
    }
  });

  return (
    <primitive
      ref={modelRef}
      object={gltf.scene}
      position={
        modelPath.includes("vr.glb") || modelPath.includes("wooden_box.glb")
          ? [0, -1, 0]
          : [0, 0, 0]
      }
      rotation={
        modelPath.includes("laptop.glb") ? [0, -Math.PI / 4, 0] : [0, 0, 0]
      }
    />
  );
}

function Lights() {
  return (
    <>
      <ambientLight intensity={1} />
      <directionalLight position={[2, 2, 2]} intensity={1} />
      <spotLight position={[2, 2, 2]} intensity={1} />
    </>
  );
}

function LoadingSpinner() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin" />
    </div>
  );
}

function NavigationButton({ direction, onClick, disabled }) {
  const Icon = direction === "left" ? ChevronLeft : ChevronRight;
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`bg-white/10 hover:bg-white/20 p-2 md:p-4 rounded-full backdrop-blur-sm transition-all 
        ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
    >
      <Icon className="w-6 h-6 md:w-8 md:h-8 text-white" />
    </button>
  );
}

function Scene() {
  const [currentModelIndex, setCurrentModelIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [key, setKey] = useState(0);

  const handleModelLoad = () => {
    setIsLoading(false);
  };

  const nextModel = () => {
    if (!isLoading) {
      setIsLoading(true);
      setCurrentModelIndex((prev) => (prev + 1) % models.length);
      setKey((prev) => prev + 1);
    }
  };

  const previousModel = () => {
    if (!isLoading) {
      setIsLoading(true);
      setCurrentModelIndex(
        (prev) => (prev - 1 + models.length) % models.length
      );
      setKey((prev) => prev + 1);
    }
  };

  const selectModel = (index) => {
    if (!isLoading && index !== currentModelIndex) {
      setIsLoading(true);
      setCurrentModelIndex(index);
      setKey((prev) => prev + 1);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 py-6 md:py-12 px-2 md:px-4">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-white text-2xl md:text-3xl font-bold text-center mb-4 md:mb-8">
          3D Model Viewer
        </h2>

        <div className="bg-gray-800 rounded-xl md:rounded-2xl p-4 md:p-8">
          <h3 className="text-white text-xl md:text-2xl font-bold text-center mb-4 md:mb-6">
            {models[currentModelIndex].name}
          </h3>

          <div className="relative flex items-center justify-center gap-2 md:gap-8">
            <NavigationButton
              direction="left"
              onClick={previousModel}
              disabled={isLoading}
            />

            <div className="relative w-full h-[300px] md:w-[600px] md:h-[400px] bg-gray-700 rounded-xl overflow-hidden">
              {isLoading && <LoadingSpinner />}
              <Canvas
                key={key}
                camera={{
                  fov: 50,
                  near: 0.1,
                  far: 1000,
                  position: models[currentModelIndex].cameraPosition,
                }}
              >
                <Suspense fallback={null}>
                  <Environment files="https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/zwartkops_pit_1k.hdr" />
                  <Lights />
                  <OrbitControls />
                  <Model
                    modelPath={models[currentModelIndex].path}
                    onLoad={handleModelLoad}
                  />
                </Suspense>
              </Canvas>
            </div>

            <NavigationButton
              direction="right"
              onClick={nextModel}
              disabled={isLoading}
            />
          </div>

          <div className="flex justify-center gap-2 md:gap-3 mt-4 md:mt-8">
            {models.map((_, index) => (
              <button
                key={index}
                onClick={() => selectModel(index)}
                disabled={isLoading}
                className={`w-3 h-3 md:w-4 md:h-4 rounded-full transition-all ${
                  index === currentModelIndex
                    ? "bg-white scale-110"
                    : "bg-white/30 hover:bg-white/50"
                } ${isLoading ? "cursor-not-allowed" : "cursor-pointer"}`}
                aria-label={`View ${models[index].name}`}
              />
            ))}
          </div>

          <div className="mt-4 md:mt-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 md:gap-4">
            {models.map((model, index) => (
              <button
                key={index}
                onClick={() => selectModel(index)}
                disabled={isLoading}
                className={`p-2 md:p-4 rounded-lg transition-all ${
                  index === currentModelIndex
                    ? "bg-white/20 ring-2 ring-white"
                    : "bg-white/5 hover:bg-white/10"
                } ${
                  isLoading ? "cursor-not-allowed opacity-50" : "cursor-pointer"
                }`}
              >
                <p className="text-white text-sm md:text-base text-center font-medium">
                  {model.name}
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Scene;

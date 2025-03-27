import type * as THREE from "three";
import { Bounds } from "@react-three/drei";
import { useRef, useEffect, useState } from "react";
import { useThree } from "@react-three/fiber";
import usePlayerAnimation from "../hooks/usePlayerAnimation";
import { DirectionalLight } from "./DirectionalLight";
import { updateCameraPosition } from "../stores/camera";
import { themeStore } from "../stores/themeStore";

export function Player() {
  const player = useRef<THREE.Group>(null);
  const lightRef = useRef<THREE.DirectionalLight>(null);
  const { camera } = useThree();
  const [colors, setColors] = useState({
    player: themeStore.getThemeColors().player,
    playerGun: themeStore.getThemeColors().playerGun
  });

  // Use the player animation hook
  usePlayerAnimation(player, camera);

  useEffect(() => {
    if (!player.current) return;
    if (!lightRef.current) return;

    // Only set light target
    lightRef.current.target = player.current;
    
    // Initialize camera position
    updateCameraPosition(camera, player.current.position);
    
    // Listen for theme changes
    const handleThemeChange = () => {
      setColors({
        player: themeStore.getThemeColors().player,
        playerGun: themeStore.getThemeColors().playerGun
      });
    };
    
    window.addEventListener('themeChanged', handleThemeChange);
    
    return () => {
      window.removeEventListener('themeChanged', handleThemeChange);
    };
  }, [camera]);

  return (
    <Bounds fit clip observe margin={10}>
      <group ref={player}>
        <group>
          <mesh position={[0, 0, 10]} castShadow receiveShadow>
            <boxGeometry args={[15, 15, 20]} />
            <meshLambertMaterial color={colors.player} flatShading />
          </mesh>
          <mesh position={[0, 0, 21]} castShadow receiveShadow>
            <boxGeometry args={[2, 4, 2]} />
            <meshLambertMaterial color={colors.playerGun} flatShading />
          </mesh>
        </group>
        <DirectionalLight ref={lightRef} />
      </group>
    </Bounds>
  );
}
import { tileSize } from "../constants";
import { useEffect, useState } from "react";
import { themeStore } from "../stores/themeStore";

type Props = {
  tileIndex: number;
  height: number;
};

export function Tree({ tileIndex, height }: Props) {
  const [colors, setColors] = useState({
    trunk: themeStore.getThemeColors().tree.trunk,
    foliage: themeStore.getThemeColors().tree.foliage
  });
  
  useEffect(() => {
    const handleThemeChange = () => {
      setColors({
        trunk: themeStore.getThemeColors().tree.trunk,
        foliage: themeStore.getThemeColors().tree.foliage
      });
    };
    
    window.addEventListener('themeChanged', handleThemeChange);
    
    return () => {
      window.removeEventListener('themeChanged', handleThemeChange);
    };
  }, []);
  
  return (
    <group position-x={tileIndex * tileSize}>
      <mesh position-z={height / 2 + 20} castShadow receiveShadow>
        <boxGeometry args={[30, 30, height]} />
        <meshLambertMaterial color={colors.foliage} flatShading />
      </mesh>
      <mesh position-z={10} castShadow receiveShadow>
        <boxGeometry args={[15, 15, 20]} />
        <meshLambertMaterial color={colors.trunk} flatShading />
      </mesh>
    </group>
  );
}
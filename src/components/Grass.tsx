import { tilesPerRow, tileSize } from "../constants";
import { useEffect, useState } from "react";
import { themeStore } from "../stores/themeStore";

type Props = {
  rowIndex: number;
  children?: React.ReactNode;
};

export function Grass({ rowIndex, children }: Props) {
  const [grassColor, setGrassColor] = useState(themeStore.getThemeColors().grass);
  
  useEffect(() => {
    const handleThemeChange = () => {
      setGrassColor(themeStore.getThemeColors().grass);
    };
    
    window.addEventListener('themeChanged', handleThemeChange);
    
    return () => {
      window.removeEventListener('themeChanged', handleThemeChange);
    };
  }, []);
  
  return (
    <group position-y={rowIndex * tileSize}>
      <mesh receiveShadow>
        <boxGeometry args={[tilesPerRow * tileSize, tileSize, 3]} />
        <meshLambertMaterial color={grassColor} flatShading />
      </mesh>
      {children}
    </group>
  );
}
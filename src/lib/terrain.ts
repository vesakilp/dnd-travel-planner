import { Terrain } from "./types";

export interface TerrainConfig {
  label: string;
  multiplier: number;
  description: string;
}

export const TERRAIN_CONFIG: Record<Terrain, TerrainConfig> = {
  arctic: { label: "Arctic", multiplier: 0.75, description: "Frozen tundra and ice fields slow travel." },
  coast: { label: "Coast", multiplier: 1.0, description: "Sandy beaches and cliffs at normal speed." },
  desert: { label: "Desert", multiplier: 0.75, description: "Shifting sands and heat sap endurance." },
  forest: { label: "Forest", multiplier: 0.75, description: "Dense canopy and undergrowth hamper movement." },
  grassland: { label: "Grassland", multiplier: 1.0, description: "Open plains allow unimpeded travel." },
  hill: { label: "Hill", multiplier: 0.75, description: "Rolling hills require extra effort." },
  mountain: { label: "Mountain", multiplier: 0.5, description: "Steep peaks drastically slow overland travel." },
  swamp: { label: "Swamp", multiplier: 0.5, description: "Soggy ground and thick reeds make every mile a slog." },
  underdark: { label: "Underdark", multiplier: 0.75, description: "Narrow tunnels and treacherous rock limit speed." },
  urban: { label: "Urban", multiplier: 1.0, description: "Streets and roads offer standard travel speed." },
  waterborne: { label: "Waterborne", multiplier: 1.0, description: "Open water — vessel speed determines pace." },
};

export function getTerrainMultiplier(terrain: Terrain): number {
  return TERRAIN_CONFIG[terrain]?.multiplier ?? 1.0;
}

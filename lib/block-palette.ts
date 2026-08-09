export interface PaletteEntry {
  rgb: [number, number, number];
  block: string;
}

// Küçük, temsili bir renk -> vanilla Minecraft blok paleti.
// Beton renkleri (concrete), yün'e göre daha düz/doygun renkler verdiği için tercih edildi.
export const BLOCK_PALETTE: PaletteEntry[] = [
  { rgb: [207, 213, 214], block: 'minecraft:white_concrete' },
  { rgb: [224, 97, 1], block: 'minecraft:orange_concrete' },
  { rgb: [169, 48, 159], block: 'minecraft:magenta_concrete' },
  { rgb: [36, 137, 199], block: 'minecraft:light_blue_concrete' },
  { rgb: [241, 175, 21], block: 'minecraft:yellow_concrete' },
  { rgb: [94, 168, 24], block: 'minecraft:lime_concrete' },
  { rgb: [208, 133, 153], block: 'minecraft:pink_concrete' },
  { rgb: [54, 57, 61], block: 'minecraft:gray_concrete' },
  { rgb: [125, 125, 115], block: 'minecraft:light_gray_concrete' },
  { rgb: [21, 119, 136], block: 'minecraft:cyan_concrete' },
  { rgb: [100, 32, 156], block: 'minecraft:purple_concrete' },
  { rgb: [45, 47, 143], block: 'minecraft:blue_concrete' },
  { rgb: [96, 60, 32], block: 'minecraft:brown_concrete' },
  { rgb: [73, 91, 36], block: 'minecraft:green_concrete' },
  { rgb: [142, 33, 33], block: 'minecraft:red_concrete' },
  { rgb: [8, 10, 15], block: 'minecraft:black_concrete' },
  { rgb: [125, 125, 125], block: 'minecraft:stone' },
  { rgb: [122, 122, 122], block: 'minecraft:cobblestone' },
  { rgb: [162, 130, 78], block: 'minecraft:oak_planks' },
  { rgb: [102, 81, 51], block: 'minecraft:oak_log' },
  { rgb: [66, 43, 20], block: 'minecraft:dark_oak_planks' },
  { rgb: [150, 97, 83], block: 'minecraft:bricks' },
  { rgb: [219, 207, 163], block: 'minecraft:sand' },
  { rgb: [134, 96, 67], block: 'minecraft:dirt' },
  { rgb: [95, 159, 53], block: 'minecraft:grass_block' },
  { rgb: [220, 237, 237], block: 'minecraft:glass' },
  { rgb: [220, 222, 222], block: 'minecraft:iron_block' },
  { rgb: [249, 236, 79], block: 'minecraft:gold_block' },
  { rgb: [20, 18, 29], block: 'minecraft:obsidian' },
  { rgb: [249, 254, 254], block: 'minecraft:snow_block' },
];

export function nearestBlock(rgb: [number, number, number]): string {
  let best = BLOCK_PALETTE[0];
  let bestDist = Infinity;

  for (const entry of BLOCK_PALETTE) {
    const dr = rgb[0] - entry.rgb[0];
    const dg = rgb[1] - entry.rgb[1];
    const db = rgb[2] - entry.rgb[2];
    const dist = dr * dr + dg * dg + db * db;
    if (dist < bestDist) {
      bestDist = dist;
      best = entry;
    }
  }

  return best.block;
}

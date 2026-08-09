import { ai } from './gemini';

export type ItemCategory = 'weapon' | 'tool' | 'item';

export interface AttributeModifier {
  attribute: string;
  amount: number;
  operation: 'add_value' | 'add_multiplied_base' | 'add_multiplied_total';
  slot?: string;
}

export interface ItemRecipe {
  pattern: string[];
  key: Record<string, string>;
}

export interface GeneratedEnchantment {
  id: string;
  level: number;
}

export interface GeneratedItem {
  name: string;
  itemId: string;
  baseItem: string;
  lore: string[];
  attributeModifiers: AttributeModifier[];
  enchantments: GeneratedEnchantment[];
  unbreakable: boolean;
  recipe: ItemRecipe | null;
}

const MAX_LORE_LINES = 4;
const MAX_ATTRIBUTES = 4;

const CATEGORY_LABELS: Record<ItemCategory, string> = {
  weapon: 'silah (kılıç, yay, tirident vb.)',
  tool: 'alet (kazma, balta, kürek vb.)',
  item: 'serbest bir eşya',
};

const BASE_ITEM_ALLOWLIST: Record<ItemCategory, { items: string[]; fallback: string }> = {
  weapon: {
    items: [
      'iron_sword',
      'diamond_sword',
      'netherite_sword',
      'golden_sword',
      'wooden_sword',
      'bow',
      'crossbow',
      'trident',
      'mace',
    ],
    fallback: 'iron_sword',
  },
  tool: {
    items: [
      'iron_pickaxe',
      'diamond_pickaxe',
      'netherite_pickaxe',
      'iron_axe',
      'iron_shovel',
      'iron_hoe',
      'fishing_rod',
      'shears',
      'flint_and_steel',
    ],
    fallback: 'iron_pickaxe',
  },
  item: {
    items: [
      'paper',
      'stick',
      'feather',
      'nether_star',
      'diamond',
      'emerald',
      'book',
      'potion',
      'name_tag',
      'saddle',
    ],
    fallback: 'stick',
  },
};

const ATTRIBUTE_ALLOWLIST = [
  'attack_damage',
  'attack_speed',
  'movement_speed',
  'max_health',
  'luck',
  'armor',
  'armor_toughness',
  'block_break_speed',
];

const OPERATION_ALLOWLIST = ['add_value', 'add_multiplied_base', 'add_multiplied_total'];

const MAX_ENCHANTMENTS = 3;

const ENCHANTMENT_ALLOWLIST = [
  'sharpness',
  'smite',
  'bane_of_arthropods',
  'knockback',
  'fire_aspect',
  'looting',
  'sweeping_edge',
  'efficiency',
  'silk_touch',
  'fortune',
  'unbreaking',
  'mending',
  'power',
  'punch',
  'flame',
  'infinity',
  'piercing',
  'quick_charge',
  'multishot',
  'loyalty',
  'riptide',
  'channeling',
  'impaling',
  'luck_of_the_sea',
  'lure',
  'depth_strider',
  'frost_walker',
  'respiration',
  'aqua_affinity',
  'protection',
  'feather_falling',
  'thorns',
];

const itemSchema = {
  type: 'OBJECT',
  properties: {
    name: { type: 'STRING', description: 'Kısa, tanıtıcı bir isim (örn. "Alev Yalını")' },
    itemId: { type: 'STRING', description: 'Dosya adı olarak kullanılabilecek İngilizce kısa slug (örn. "flame_reaver")' },
    baseItem: { type: 'STRING', description: 'Bu kategoriye uygun vanilla Minecraft Java Edition item ID\'si, "minecraft:" öneki ile' },
    lore: { type: 'ARRAY', items: { type: 'STRING' }, description: `En fazla ${MAX_LORE_LINES} kısa açıklama satırı` },
    attributeModifiers: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          attribute: { type: 'STRING' },
          amount: { type: 'NUMBER' },
          operation: { type: 'STRING' },
          slot: { type: 'STRING' },
        },
        required: ['attribute', 'amount', 'operation'],
      },
      description: `En fazla ${MAX_ATTRIBUTES} özellik`,
    },
    enchantments: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          id: { type: 'STRING' },
          level: { type: 'NUMBER' },
        },
        required: ['id', 'level'],
      },
      description: `En fazla ${MAX_ENCHANTMENTS} vanilla enchantment`,
    },
    unbreakable: { type: 'BOOLEAN' },
    recipe: {
      type: 'OBJECT',
      nullable: true,
      properties: {
        pattern: { type: 'ARRAY', items: { type: 'STRING' } },
        key: { type: 'OBJECT' },
      },
    },
  },
  required: ['name', 'itemId', 'baseItem', 'lore', 'attributeModifiers', 'enchantments', 'unbreakable'],
};

export async function generateItem(prompt: string, category: ItemCategory, behavior?: string): Promise<GeneratedItem> {
  const allowlist = BASE_ITEM_ALLOWLIST[category];

  const behaviorInstruction =
    behavior && behavior.trim().length > 0
      ? `\nKullanıcının istediği davranış/etki: "${behavior.trim()}"\nBu davranışı en yakın gerçek Minecraft mekaniğiyle yansıt: örneğin "vurulunca yansın" isteniyorsa fire_aspect enchantment'i, "vurulunca uzağa savrulsun" isteniyorsa knockback enchantment'i veya bir movement_speed/attack_damage attributeModifier'ı, "daha hızlı kazsın" isteniyorsa efficiency enchantment'i kullan. Davranışı ayrıca lore satırlarına da kısaca yansıt.`
      : '';

  const response = await ai.models.generateContent({
    model: 'gemini-flash-latest',
    contents: `Sen bir Minecraft Java Edition ${CATEGORY_LABELS[category]} tasarımcısısın. Kullanıcının tarif ettiği fikri
gerçek bir Minecraft item'ına dönüştür.

Kısıtlar:
- baseItem sadece şu listeden biri olmalı (önek olmadan): ${allowlist.items.join(', ')}
- En fazla ${MAX_LORE_LINES} lore satırı kullan, her biri kısa ve atmosferik olsun.
- En fazla ${MAX_ATTRIBUTES} attributeModifier kullan. attribute sadece şu listeden olmalı: ${ATTRIBUTE_ALLOWLIST.join(', ')}. operation sadece şu listeden olmalı: ${OPERATION_ALLOWLIST.join(', ')}.
- En fazla ${MAX_ENCHANTMENTS} enchantment kullan. id sadece şu listeden olmalı (önek olmadan): ${ENCHANTMENT_ALLOWLIST.join(', ')}. level 1 ile 5 arasında olmalı.
- unbreakable, eşyanın fikrine uygunsa true yap.
- Eğer mantıklı bir crafting tarifi üretebiliyorsan recipe alanını doldur (3x3 pattern, en fazla 3 satır/3 sütun, key harfleri vanilla item ID'lerine eşlenir), üretemiyorsan null bırak.
${behaviorInstruction}
Kullanıcının tarifi: "${prompt}"`,
    config: {
      responseMimeType: 'application/json',
      responseSchema: itemSchema,
    },
  });

  if (!response.text) {
    throw new Error('Gemini boş yanıt döndürdü');
  }

  const parsed = JSON.parse(response.text) as GeneratedItem;

  const baseItemBare = (parsed.baseItem ?? '').replace(/^minecraft:/, '');
  const baseItem = allowlist.items.includes(baseItemBare) ? `minecraft:${baseItemBare}` : `minecraft:${allowlist.fallback}`;

  const lore = Array.isArray(parsed.lore)
    ? parsed.lore.filter((l) => typeof l === 'string' && l.trim().length > 0).slice(0, MAX_LORE_LINES)
    : [];

  const attributeModifiers = Array.isArray(parsed.attributeModifiers)
    ? parsed.attributeModifiers
        .filter(
          (m) =>
            m &&
            ATTRIBUTE_ALLOWLIST.includes(m.attribute) &&
            OPERATION_ALLOWLIST.includes(m.operation) &&
            typeof m.amount === 'number' &&
            Number.isFinite(m.amount),
        )
        .slice(0, MAX_ATTRIBUTES)
        .map((m) => ({
          attribute: m.attribute,
          amount: m.amount,
          operation: m.operation,
          ...(category === 'weapon' ? { slot: 'mainhand' } : {}),
        }))
    : [];

  const enchantments = Array.isArray(parsed.enchantments)
    ? parsed.enchantments
        .filter(
          (e) =>
            e &&
            typeof e.id === 'string' &&
            ENCHANTMENT_ALLOWLIST.includes(e.id.replace(/^minecraft:/, '')) &&
            typeof e.level === 'number' &&
            Number.isFinite(e.level),
        )
        .slice(0, MAX_ENCHANTMENTS)
        .map((e) => ({
          id: e.id.replace(/^minecraft:/, ''),
          level: Math.min(5, Math.max(1, Math.round(e.level))),
        }))
    : [];

  const namePart = typeof parsed.name === 'string' && parsed.name.trim().length > 0 ? parsed.name.trim() : 'Özel Eşya';
  const itemIdPart =
    typeof parsed.itemId === 'string' && parsed.itemId.trim().length > 0
      ? parsed.itemId.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_')
      : 'custom_item';

  let recipe: ItemRecipe | null = null;
  if (
    parsed.recipe &&
    Array.isArray(parsed.recipe.pattern) &&
    parsed.recipe.pattern.length > 0 &&
    parsed.recipe.pattern.length <= 3 &&
    parsed.recipe.pattern.every((row) => typeof row === 'string' && row.length <= 3) &&
    parsed.recipe.key &&
    typeof parsed.recipe.key === 'object'
  ) {
    const key: Record<string, string> = {};
    for (const [symbol, itemId] of Object.entries(parsed.recipe.key)) {
      if (typeof itemId === 'string' && itemId.trim().length > 0) {
        key[symbol] = itemId.includes(':') ? itemId : `minecraft:${itemId}`;
      }
    }
    if (Object.keys(key).length > 0) {
      recipe = { pattern: parsed.recipe.pattern, key };
    }
  }

  return {
    name: namePart,
    itemId: itemIdPart,
    baseItem,
    lore,
    attributeModifiers,
    enchantments,
    unbreakable: Boolean(parsed.unbreakable),
    recipe,
  };
}

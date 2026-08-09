import JSZip from 'jszip';
import { toNamespace } from './pack/common';
import { buildBedrockManifestPair, bedrockRawtext } from './pack/bedrock-common';
import type { GeneratedItem, ItemCategory } from './item-generation';

const MENU_CATEGORY: Record<ItemCategory, string> = {
  weapon: 'equipment',
  tool: 'equipment',
  item: 'items',
};

function buildItemComponents(item: GeneratedItem, category: ItemCategory, hasIcon: boolean): Record<string, unknown> {
  const components: Record<string, unknown> = {
    'minecraft:display_name': { value: item.name },
    'minecraft:max_stack_size': category === 'item' ? 64 : 1,
    'minecraft:hand_equipped': category !== 'item',
  };

  if (hasIcon) {
    components['minecraft:icon'] = { texture: item.itemId };
  }

  if (item.lore.length > 0) {
    components['minecraft:custom_lore'] = { lore: item.lore };
  }

  if (category === 'weapon') {
    components['minecraft:weapon'] = {};
  }

  if ((category === 'weapon' || category === 'tool') && !item.unbreakable) {
    components['minecraft:durability'] = { max_durability: 250 };
  }

  const attackDamage = item.attributeModifiers.find((m) => m.attribute === 'attack_damage');
  if (attackDamage) {
    components['minecraft:damage'] = Math.max(1, Math.round(attackDamage.amount));
  }

  return components;
}

function buildItemJson(item: GeneratedItem, category: ItemCategory, identifier: string, hasIcon: boolean): string {
  return JSON.stringify(
    {
      format_version: '1.21.0',
      'minecraft:item': {
        description: {
          identifier,
          menu_category: { category: MENU_CATEGORY[category] },
        },
        components: buildItemComponents(item, category, hasIcon),
      },
    },
    null,
    2,
  );
}

function buildGiveCommand(item: GeneratedItem, identifier: string): string {
  if (item.enchantments.length === 0) {
    return `give @s ${identifier}`;
  }

  const enchantments = item.enchantments.map((e) => ({ id: e.id, level: e.level }));
  const components = JSON.stringify({ 'minecraft:enchantments': { enchantments } });
  return `give @s ${identifier} 1 0 ${components}`;
}

export async function buildBedrockItemPack(
  item: GeneratedItem,
  category: ItemCategory,
  iconPng: Buffer | null,
): Promise<Buffer> {
  const namespace = toNamespace(item.itemId || item.name);
  const identifier = `${namespace}:${item.itemId}`;
  const packName = `Lovable for Minecraft: ${item.name}`;
  const { behaviorManifest, resourceManifest } = buildBedrockManifestPair(
    packName,
    `Lovable for Minecraft ile üretildi: ${item.name}`,
  );

  const zip = new JSZip();

  const behaviorRoot = zip.folder(`${namespace}_behavior`)!;
  behaviorRoot.file('manifest.json', behaviorManifest);
  behaviorRoot.file(`items/${item.itemId}.json`, buildItemJson(item, category, identifier, iconPng !== null));
  behaviorRoot.file(
    'functions/give.mcfunction',
    [
      `say ${item.name} hazırlanıyor...`,
      buildGiveCommand(item, identifier),
      `tellraw @s ${bedrockRawtext(`${item.name} tamamlandı!`)}`,
    ].join('\n'),
  );

  const resourceRoot = zip.folder(`${namespace}_resource`)!;
  resourceRoot.file('manifest.json', resourceManifest);

  if (iconPng) {
    resourceRoot.file(`textures/items/${item.itemId}.png`, iconPng);
    resourceRoot.file(
      'textures/item_texture.json',
      JSON.stringify(
        {
          resource_pack_name: namespace,
          texture_name: 'atlas.items',
          texture_data: {
            [item.itemId]: { textures: `textures/items/${item.itemId}` },
          },
        },
        null,
        2,
      ),
    );
  }

  return zip.generateAsync({ type: 'nodebuffer' });
}

export function bedrockItemFunctionId(item: GeneratedItem): string {
  return `${toNamespace(item.itemId || item.name)}:give`;
}

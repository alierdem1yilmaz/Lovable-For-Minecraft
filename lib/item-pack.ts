import JSZip from 'jszip';
import { toNamespace, buildPackMcmeta, buildFunctionId } from './pack/common';
import type { GeneratedItem, ItemCategory } from './item-generation';

function escapeSnbtString(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

function attributeModifierId(index: number): string {
  return `lovable:mod_${index}`;
}

function buildComponentsSnbt(item: GeneratedItem): string {
  const parts: string[] = [];

  parts.push(`minecraft:custom_name={text:"${escapeSnbtString(item.name)}",italic:false}`);

  if (item.lore.length > 0) {
    const loreEntries = item.lore.map((line) => `"${escapeSnbtString(line)}"`).join(',');
    parts.push(`minecraft:lore=[${loreEntries}]`);
  }

  if (item.attributeModifiers.length > 0) {
    const modifiers = item.attributeModifiers
      .map((m, i) => {
        const slotPart = m.slot ? `,slot:"${m.slot}"` : '';
        return `{type:"minecraft:${m.attribute}",id:"${attributeModifierId(i)}",amount:${m.amount},operation:"${m.operation}"${slotPart}}`;
      })
      .join(',');
    parts.push(`minecraft:attribute_modifiers=[${modifiers}]`);
  }

  if (item.unbreakable) {
    parts.push('minecraft:unbreakable={}');
  }

  return parts.join(',');
}

function buildComponentsJson(item: GeneratedItem): Record<string, unknown> {
  const components: Record<string, unknown> = {
    'minecraft:custom_name': { text: item.name, italic: false },
  };

  if (item.lore.length > 0) {
    components['minecraft:lore'] = item.lore;
  }

  if (item.attributeModifiers.length > 0) {
    components['minecraft:attribute_modifiers'] = item.attributeModifiers.map((m, i) => ({
      type: `minecraft:${m.attribute}`,
      id: attributeModifierId(i),
      amount: m.amount,
      operation: m.operation,
      ...(m.slot ? { slot: m.slot } : {}),
    }));
  }

  if (item.unbreakable) {
    components['minecraft:unbreakable'] = {};
  }

  return components;
}

const CATEGORY_LABELS: Record<ItemCategory, string> = {
  weapon: 'silah',
  tool: 'alet',
  item: 'eşya',
};

export async function buildItemDataPack(item: GeneratedItem, category: ItemCategory): Promise<Buffer> {
  const namespace = toNamespace(item.itemId || item.name);
  const packMcmeta = buildPackMcmeta(`Lovable for Minecraft ile üretildi: ${CATEGORY_LABELS[category]} — ${item.name}`);

  const componentsSnbt = buildComponentsSnbt(item);
  const functionLines = [
    `say ${item.name} hazırlanıyor...`,
    `give @s ${item.baseItem}[${componentsSnbt}]`,
    `tellraw @s {"text":"${item.name} tamamlandı!","color":"green"}`,
  ];

  const zip = new JSZip();
  zip.file('pack.mcmeta', packMcmeta);
  zip.file(`data/${namespace}/function/give.mcfunction`, functionLines.join('\n'));

  if (item.recipe) {
    const recipeJson = JSON.stringify(
      {
        type: 'minecraft:crafting_shaped',
        pattern: item.recipe.pattern,
        key: Object.fromEntries(Object.entries(item.recipe.key).map(([symbol, itemId]) => [symbol, { item: itemId }])),
        result: {
          id: item.baseItem,
          count: 1,
          components: buildComponentsJson(item),
        },
      },
      null,
      2,
    );
    zip.file(`data/${namespace}/recipe/${namespace}.json`, recipeJson);
  }

  return zip.generateAsync({ type: 'nodebuffer' });
}

export function itemFunctionId(item: GeneratedItem): string {
  return buildFunctionId(item.itemId || item.name, 'give');
}

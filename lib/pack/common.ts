export function toNamespace(name: string): string {
  const cleaned = name
    .toLowerCase()
    .replace(/[^a-z0-9_.-]/g, '_')
    .replace(/^[^a-z0-9]+/, '');
  return cleaned.length > 0 ? cleaned : 'custom_content';
}

export function buildPackMcmeta(description: string): string {
  return JSON.stringify(
    {
      pack: {
        pack_format: 84,
        min_format: [80, 0],
        max_format: [92, 0],
        description,
      },
    },
    null,
    2,
  );
}

export function buildFunctionId(name: string, verb: string): string {
  return `${toNamespace(name)}:${verb}`;
}

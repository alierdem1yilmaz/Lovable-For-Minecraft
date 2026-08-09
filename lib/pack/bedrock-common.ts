import { randomUUID } from 'crypto';

const MIN_ENGINE_VERSION: [number, number, number] = [1, 21, 0];

export interface BedrockManifests {
  behaviorManifest: string;
  resourceManifest: string;
}

export function buildBedrockManifestPair(name: string, description: string): BedrockManifests {
  const behaviorHeaderUuid = randomUUID();
  const behaviorModuleUuid = randomUUID();
  const resourceHeaderUuid = randomUUID();
  const resourceModuleUuid = randomUUID();

  const behaviorManifest = JSON.stringify(
    {
      format_version: 2,
      header: {
        name,
        description,
        uuid: behaviorHeaderUuid,
        version: [1, 0, 0],
        min_engine_version: MIN_ENGINE_VERSION,
      },
      modules: [{ type: 'data', uuid: behaviorModuleUuid, version: [1, 0, 0] }],
      dependencies: [{ uuid: resourceHeaderUuid, version: [1, 0, 0] }],
    },
    null,
    2,
  );

  const resourceManifest = JSON.stringify(
    {
      format_version: 2,
      header: {
        name: `${name} (Kaynak Paketi)`,
        description,
        uuid: resourceHeaderUuid,
        version: [1, 0, 0],
        min_engine_version: MIN_ENGINE_VERSION,
      },
      modules: [{ type: 'resources', uuid: resourceModuleUuid, version: [1, 0, 0] }],
    },
    null,
    2,
  );

  return { behaviorManifest, resourceManifest };
}

export function buildBedrockBehaviorOnlyManifest(name: string, description: string): string {
  return JSON.stringify(
    {
      format_version: 2,
      header: {
        name,
        description,
        uuid: randomUUID(),
        version: [1, 0, 0],
        min_engine_version: MIN_ENGINE_VERSION,
      },
      modules: [{ type: 'data', uuid: randomUUID(), version: [1, 0, 0] }],
    },
    null,
    2,
  );
}

export function bedrockRawtext(message: string): string {
  return JSON.stringify({ rawtext: [{ text: message }] });
}

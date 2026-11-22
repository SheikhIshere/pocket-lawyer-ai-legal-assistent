const CATALOG_URL =
  'https://openrouter.ai/api/v1/models?max_price=0&max_output_price=0&output_modalities=text&sort=context-high-to-low&limit=50';
const CACHE_KEY = 'pl_free_models_v1';
const CACHE_TTL = 60 * 60 * 1000;
const MAX_MODELS = 5;

export type FreeModel = {
  id: string;
  name: string;
  contextLength: number;
  legalIndex: number | null;
};

type Cache = {
  fetchedAt: number;
  models: FreeModel[];
};

const isZero = (value: unknown) =>
  value === null || value === undefined || String(value) === '0' || String(value) === '0.0';

const readCache = (): Cache | null => {
  try {
    const raw = window.localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Cache;
    return Array.isArray(parsed?.models) ? parsed : null;
  } catch {
    return null;
  }
};

const writeCache = (models: FreeModel[]) => {
  try {
    window.localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ fetchedAt: Date.now(), models }),
    );
  } catch {
    // private mode / quota: the live response still works for this render
  }
};

export async function fetchFreeModels(): Promise<FreeModel[]> {
  const cached = readCache();
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL) {
    return cached.models;
  }

  try {
    const response = await fetch(CATALOG_URL, {
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const payload = await response.json();
    const rows = Array.isArray(payload?.data) ? payload.data : [];

    const models: FreeModel[] = rows
      .filter((model: any) => {
        const output = model?.architecture?.output_modalities;
        return Array.isArray(output) && output.length === 1 && output[0] === 'text';
      })
      .filter((model: any) => {
        const price = model?.pricing || {};
        return (
          isZero(price.prompt) &&
          isZero(price.completion) &&
          isZero(price.request) &&
          isZero(price.image)
        );
      })
      .map((model: any) => ({
        id: String(model.id),
        name: model.name || String(model.id),
        contextLength: Number(model.context_length) || 0,
        legalIndex: model?.benchmarks?.artificial_analysis?.legal_index ?? null,
      }))
      .sort(
        (a, b) =>
          b.contextLength - a.contextLength ||
          (b.legalIndex ?? -1) - (a.legalIndex ?? -1) ||
          a.name.localeCompare(b.name),
      )
      .slice(0, MAX_MODELS);

    writeCache(models);
    return models;
  } catch {
    return cached?.models ?? [];
  }
}

// Depois que o painel abre, baixa em segundo plano as outras telas do menu —
// assim trocar de aba é instantâneo (no celular faz bastante diferença).
// Os imports são os mesmos dos lazy() das rotas, então o navegador reaproveita.
export function prefetchWhenIdle(loaders: (() => Promise<unknown>)[]) {
  const run = () => loaders.forEach((l) => l().catch(() => {}));
  const w = window as Window & { requestIdleCallback?: (cb: () => void) => void };
  if (w.requestIdleCallback) w.requestIdleCallback(run);
  else setTimeout(run, 1500);
}

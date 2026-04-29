let hasBooted = false;

export function bootSharedClient(): void {
  if (import.meta.env.SSR || hasBooted) {
    return;
  }

  hasBooted = true;
  document.documentElement.dataset.sharedShell = "ready";
  window.dispatchEvent(new CustomEvent("site:shared-client-ready"));
}

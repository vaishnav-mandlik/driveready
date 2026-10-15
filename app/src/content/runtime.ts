/**
 * Content overrides delivered by over-the-air content updates (see ./updates.ts).
 * Every generated loader in ./index.ts goes through load(): an installed update for that file wins,
 * otherwise the JSON bundled in the app is used. Kept tiny and dependency-free so index.ts can import it.
 */

const overrides = new Map<string, unknown>();

/** The bundled file, or its installed update. `path` is relative to src/content (e.g. "questions/car/parking.json"). */
export function load<T>(path: string, bundled: () => T): T {
  return (overrides.has(path) ? overrides.get(path) : bundled()) as T;
}

/** Content of a file that exists only as an update (not bundled). */
export function remote<T>(path: string): T {
  return overrides.get(path) as T;
}

export function setOverrides(entries: Map<string, unknown>) {
  overrides.clear();
  for (const [k, v] of entries) {
    overrides.set(k, v);
  }
}

export function overrideCount(): number {
  return overrides.size;
}

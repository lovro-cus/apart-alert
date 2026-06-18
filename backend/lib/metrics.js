// Čista logika za agregacijo metrik in priljubljenih (brez Supabase).

/**
 * Prešteje dogodke po tipu iz metrics_log zapisov.
 * @param {Array<{event_type: string, event_data?: object}>} metrics
 * @returns {{logins: number, registers: number, searches: Array}}
 */
export function countEvents(metrics = []) {
  const logins = metrics.filter((x) => x.event_type === "login").length;
  const registers = metrics.filter((x) => x.event_type === "register").length;
  const searches = metrics.filter((x) => x.event_type === "search");
  return { logins, registers, searches };
}

/**
 * Vrne top N lokacij po številu iskanj.
 * @param {Array<{event_data?: {location?: string}}>} searches
 * @param {number} n
 * @returns {Array<[string, number]>} pari [lokacija, število], padajoče
 */
export function topLocations(searches = [], n = 5) {
  const counts = {};
  searches.forEach((s) => {
    const loc = s.event_data?.location?.toLowerCase();
    if (!loc) return;
    counts[loc] = (counts[loc] || 0) + 1;
  });

  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n);
}

/**
 * Vrne top N apartmajev po številu dodajanj med priljubljene.
 * @param {Array<{apartment_id: number|string}>} favorites
 * @param {number} n
 * @returns {Array<{apartmentId: number, count: number}>}
 */
export function topFavorites(favorites = [], n = 10) {
  const counts = {};
  favorites.forEach((f) => {
    counts[f.apartment_id] = (counts[f.apartment_id] || 0) + 1;
  });

  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([id, count]) => ({ apartmentId: Number(id), count }))
    .slice(0, n);
}

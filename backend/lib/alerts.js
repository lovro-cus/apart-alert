// Čista logika za ujemanje alertov in analitiko (brez Supabase).

/**
 * Vrne apartmaje, ki ustrezajo enemu alertu (lokacija + cenovni razpon).
 * @param {Array} apartments
 * @param {{location: string, min_price: number, max_price: number}} alert
 * @returns {Array} ujemajoči apartmaji
 */
export function findMatches(apartments, alert) {
  const needle = String(alert.location || "").toLowerCase();
  return apartments.filter(
    (a) =>
      a.location.toLowerCase().includes(needle) &&
      a.price >= alert.min_price &&
      a.price <= alert.max_price
  );
}

/**
 * Prešteje alerte po lokaciji.
 * @param {Array<{location: string}>} alerts
 * @returns {Object<string, number>}
 */
export function analyticsPerLocation(alerts = []) {
  const perLocation = {};
  alerts.forEach((a) => {
    perLocation[a.location] = (perLocation[a.location] || 0) + 1;
  });
  return perLocation;
}

// Čista logika za iskanje/filtriranje apartmajev (brez Supabase, lahko unit-testiraj).

/**
 * Filtrira seznam apartmajev po lokaciji in cenovnem razponu.
 * @param {Array} apartments seznam apartmajev
 * @param {{location?: string, minPrice?: string|number, maxPrice?: string|number}} filters
 * @returns {Array} filtrirani apartmaji
 */
export function filterApartments(apartments, { location, minPrice, maxPrice } = {}) {
  let results = apartments;

  if (location) {
    const needle = String(location).toLowerCase();
    results = results.filter((a) => a.location.toLowerCase().includes(needle));
  }

  if (minPrice !== undefined && minPrice !== null && minPrice !== "") {
    const min = parseInt(minPrice, 10);
    results = results.filter((a) => a.price >= min);
  }

  if (maxPrice !== undefined && maxPrice !== null && maxPrice !== "") {
    const max = parseInt(maxPrice, 10);
    results = results.filter((a) => a.price <= max);
  }

  return results;
}

/**
 * Vrne nove (ne mutira) sortiran seznam apartmajev po numeričnem polju.
 * @param {Array} apartments
 * @param {string} field npr. "price", "rating", "distance"
 * @param {"asc"|"desc"} order
 */
export function sortApartments(apartments, field, order = "asc") {
  return [...apartments].sort((a, b) =>
    order === "asc" ? a[field] - b[field] : b[field] - a[field]
  );
}

/**
 * Vrne apartma z danim id-jem ali null, če ne obstaja.
 * @param {Array} apartments
 * @param {number|string} id
 * @returns {object|null}
 */
export function getApartmentById(apartments, id) {
  const targetId = Number(id);
  if (Number.isNaN(targetId)) return null;
  return apartments.find((a) => a.id === targetId) || null;
}

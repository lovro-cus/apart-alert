// Čista logika za frontend (brez Reacta), zato lahko unit-testiramo.

const ADMIN_EMAIL = "culjo41@gmail.com";

/**
 * Vrne nov sortiran seznam apartmajev po numeričnem polju (ne mutira vhoda).
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
 * Preveri, ali je email admin.
 * @param {string} email
 * @returns {boolean}
 */
export function isAdminEmail(email) {
  return email === ADMIN_EMAIL;
}

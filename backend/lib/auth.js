// Čista logika za avtorizacijo (brez Supabase).

/**
 * Preveri, ali je dani email admin.
 * @param {string|undefined} email
 * @param {string} adminEmail
 * @returns {boolean}
 */
export function isAdmin(email, adminEmail) {
  return email === adminEmail;
}

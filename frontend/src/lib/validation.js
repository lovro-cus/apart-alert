// Validacijska logika za obrazce.

/**
 * Preveri vnos pri spremembi gesla.
 * @param {string} newPassword
 * @param {string} confirmPassword
 * @returns {{ok: boolean, error: string|null}}
 */
export function validatePasswordChange(newPassword, confirmPassword) {
  if (!newPassword || newPassword !== confirmPassword) {
    return { ok: false, error: "Gesli se ne ujemata ali sta prazni." };
  }
  return { ok: true, error: null };
}

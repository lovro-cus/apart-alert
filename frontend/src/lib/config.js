// Naslov backenda. V produkciji ga nastavi prek VITE_API_URL (build-time env),
// lokalno pa pade nazaj na localhost:5000.
export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

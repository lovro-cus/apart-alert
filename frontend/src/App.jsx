import { useState, useEffect } from "react";
import axios from "axios";

const API_URL = "http://localhost:5000";

export default function App() {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const [token, setToken] = useState(null); // Supabase user token

  const [search, setSearch] = useState({
    location: "",
    minPrice: "",
    maxPrice: "",
  });

  const [results, setResults] = useState([]);
  const [favorites, setFavorites] = useState([]);

  const [alert, setAlert] = useState("");
  const [fadeIn, setFadeIn] = useState(false);

  const [sortBy, setSortBy] = useState("price");
  const [sortOrder, setSortOrder] = useState("asc");

  useEffect(() => {
    setFadeIn(false);
    setTimeout(() => setFadeIn(true), 50);
  }, [mode]);

  // ============================================
  // LOGIN / REGISTER
  // ============================================

  const handleAuth = async (e) => {
    e.preventDefault();

    try {
      const endpoint = mode === "login" ? "/login" : "/register";
      const res = await axios.post(`${API_URL}${endpoint}`, {
        email,
        password,
      });

      setMessage(res.data.message);

      // če login → shrani token
      if (mode === "login") {
        setToken(res.data.token);
        setMode("search");
      }
    } catch (err) {
      setMessage(err.response?.data?.error || "Napaka");
    }
  };

  // ============================================
  // LOAD FAVORITES WHEN LOGGED IN
  // ============================================

  useEffect(() => {
    if (!token) return;

    axios
      .get(`${API_URL}/favorites`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setFavorites(res.data.favorites))
      .catch(() => {});
  }, [token]);

  // ============================================
  // SEARCH
  // ============================================

  const handleSearch = async (e) => {
    e.preventDefault();

    const res = await axios.get(`${API_URL}/search`, {
      params: search,
    });

    setResults(res.data.results);
  };

  // ============================================
  // SORTING
  // ============================================

  const handleSort = (field) => {
    setSortBy(field);

    const sorted = [...results].sort((a, b) => {
      if (sortOrder === "asc") return a[field] - b[field];
      return b[field] - a[field];
    });

    setResults(sorted);
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  // ============================================
  // FAVORITES (SUPABASE)
  // ============================================

  const toggleFavorite = async (apartmentId) => {
    if (!token) return;

    await axios.post(`${API_URL}/favorite`, {
      userToken: token,
      apartmentId,
    });

    const favRes = await axios.get(`${API_URL}/favorites`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    setFavorites(favRes.data.favorites);

    setAlert("Posodobljeni priljubljeni.");
    setTimeout(() => setAlert(""), 1500);
  };

  // ============================================
  // STYLES
  // ============================================

  const containerStyle = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    minHeight: "100vh",
  };

  const cardStyle = {
    background: "#fff",
    borderRadius: 20,
    padding: "35px 45px",
    width: "100%",
    maxWidth: 460,
    boxShadow: "0 12px 30px rgba(0, 0, 0, 0.15)",
    transform: fadeIn ? "translateY(0)" : "translateY(30px)",
    opacity: fadeIn ? 1 : 0,
    transition: "all 0.5s ease",
  };

  const inputStyle = {
    width: "100%",
    marginBottom: 14,
    padding: 12,
    borderRadius: 10,
    border: "1px solid #ccc",
    fontSize: 15,
    backgroundColor: "#f9f9f9",
  };

  const buttonStyle = {
    width: "100%",
    padding: 12,
    background: "#007bff",
    color: "white",
    fontSize: 16,
    border: "none",
    borderRadius: 10,
    cursor: "pointer",
  };

  // ============================================
  // SEARCH VIEW
  // ============================================

  if (mode === "search") {
    return (
      <div style={containerStyle}>
        <div style={cardStyle}>
          <h2 style={{ textAlign: "center", marginBottom: 25 }}>
            Iskanje apartmajev
          </h2>

          <form onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Lokacija (npr. Maribor)"
              value={search.location}
              onChange={(e) =>
                setSearch({ ...search, location: e.target.value })
              }
              style={inputStyle}
            />

            <input
              type="number"
              placeholder="Min cena (€)"
              value={search.minPrice}
              onChange={(e) =>
                setSearch({ ...search, minPrice: e.target.value })
              }
              style={inputStyle}
            />

            <input
              type="number"
              placeholder="Max cena (€)"
              value={search.maxPrice}
              onChange={(e) =>
                setSearch({ ...search, maxPrice: e.target.value })
              }
              style={inputStyle}
            />

            <button type="submit" style={{ ...buttonStyle, marginBottom: 12 }}>
              Išči
            </button>
          </form>

          <div style={{ display: "flex", gap: 10, marginBottom: 15 }}>
            <button
              style={{ ...buttonStyle, background: "#28a745" }}
              onClick={() => handleSort("price")}
            >
              CENA {sortBy === "price" ? (sortOrder === "asc" ? "↑" : "↓") : ""}
            </button>

            <button
              style={{ ...buttonStyle, background: "#ff9800" }}
              onClick={() => handleSort("rating")}
            >
              OCENA {sortBy === "rating" ? (sortOrder === "asc" ? "↑" : "↓") : ""}
            </button>

            <button
              style={{ ...buttonStyle, background: "#6f42c1" }}
              onClick={() => handleSort("distance")}
            >
              RAZDALJA{" "}
              {sortBy === "distance" ? (sortOrder === "asc" ? "↑" : "↓") : ""}
            </button>
          </div>

          {alert && (
            <div
              style={{
                marginTop: 10,
                background: "#e3fcef",
                color: "#0b8b3e",
                padding: 10,
                borderRadius: 8,
                textAlign: "center",
                fontSize: 14,
              }}
            >
              {alert}
            </div>
          )}

          <button
            onClick={async () => {
              const res = await axios.get(`${API_URL}/favorites`, {
                headers: { Authorization: `Bearer ${token}` },
              });
              setResults(res.data.favorites);
            }}
            style={{
              ...buttonStyle,
              background: "#ffc107",
              marginBottom: 15,
            }}
          >
            Moji priljubljeni
          </button>


          <h3 style={{ marginTop: 25 }}>Rezultati:</h3>

          {results.length === 0 ? (
            <p>Ni rezultatov</p>
          ) : (
            <ul style={{ listStyle: "none", padding: 0 }}>
              {results.map((r) => (
                <li
                  key={r.id}
                  style={{
                    background: "#f3f8ff",
                    padding: "12px 15px",
                    marginBottom: 10,
                    borderRadius: 10,
                    borderLeft: "4px solid #007bff",
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <div>
                    <b>{r.name}</b> – {r.location}
                    <div style={{ color: "#007bff" }}>{r.price} € / noč</div>
                    <div>Ocena: {r.rating} ★</div>
                    <div>Razdalja: {r.distance} m</div>
                  </div>

                  <button
                    onClick={() => toggleFavorite(r.id)}
                    style={{
                      background: favorites.includes(r.id)
                        ? "#ffc107"
                        : "#e9ecef",
                      border: "none",
                      borderRadius: "50%",
                      width: 36,
                      height: 36,
                      cursor: "pointer",
                      fontSize: 18,
                    }}
                  >
                    ★
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    );
  }

  // ============================================
  // LOGIN / REGISTER VIEW
  // ============================================

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h2 style={{ textAlign: "center", marginBottom: 25 }}>
          {mode === "login" ? "Prijava" : "Registracija"}
        </h2>

        <form onSubmit={handleAuth}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={inputStyle}
          />

          <input
            type="password"
            placeholder="Geslo"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={inputStyle}
          />

          <button type="submit" style={buttonStyle}>
            {mode === "login" ? "Prijava" : "Registracija"}
          </button>
        </form>

        <p
          style={{
            color: message.includes("Napaka") ? "red" : "green",
            marginTop: 10,
          }}
        >
          {message}
        </p>

        <button
          onClick={() => setMode(mode === "login" ? "register" : "login")}
          style={{ ...buttonStyle, background: "#6c757d", marginTop: 10 }}
        >
          {mode === "login" ? "Ustvari račun" : "Nazaj na prijavo"}
        </button>
      </div>
    </div>
  );
}

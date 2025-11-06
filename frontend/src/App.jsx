import { useState, useEffect } from "react";
import axios from "axios";

const API_URL = "http://localhost:5000";

export default function App() {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState({ location: "", minPrice: "", maxPrice: "" });
  const [results, setResults] = useState([]);
  const [fadeIn, setFadeIn] = useState(false);

  useEffect(() => {
    // Uporabimo fade-in efekt pri nalaganju
    setTimeout(() => setFadeIn(true), 50);
  }, [mode]);

  const handleAuth = async (e) => {
    e.preventDefault();
    try {
      const endpoint = mode === "login" ? "/login" : "/register";
      const res = await axios.post(`${API_URL}${endpoint}`, { email, password });
      setMessage(res.data.message);
      if (mode === "login") setMode("search");
    } catch (err) {
      setMessage(err.response?.data?.error || "Napaka");
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    const { location, minPrice, maxPrice } = search;
    const res = await axios.get(`${API_URL}/search`, {
      params: { location, minPrice, maxPrice },
    });
    setResults(res.data.results);
  };

const containerStyle = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  width: "100%",
  height: "100%",
};



  const cardStyle = {
    background: "#fff",
    borderRadius: 20,
    padding: "35px 45px",
    width: "100%",
    maxWidth: 420,
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
    transition: "background 0.3s ease",
  };

  const hoverButton = (e, hover) => {
    e.target.style.background = hover ? "#0056b3" : "#007bff";
  };

  if (mode === "search") {
    return (
      <div style={containerStyle}>
        <div style={cardStyle}>
          <h2 style={{ textAlign: "center", marginBottom: 25, color: "#333" }}>Iskanje apartmajev</h2>
          <form onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Lokacija"
              value={search.location}
              onChange={(e) => setSearch({ ...search, location: e.target.value })}
              style={inputStyle}
            />
            <input
              type="number"
              placeholder="Min cena (€)"
              value={search.minPrice}
              onChange={(e) => setSearch({ ...search, minPrice: e.target.value })}
              style={inputStyle}
            />
            <input
              type="number"
              placeholder="Max cena (€)"
              value={search.maxPrice}
              onChange={(e) => setSearch({ ...search, maxPrice: e.target.value })}
              style={inputStyle}
            />
            <button
              type="submit"
              style={buttonStyle}
              onMouseEnter={(e) => hoverButton(e, true)}
              onMouseLeave={(e) => hoverButton(e, false)}
            >
              Išči
            </button>
          </form>

          <h3 style={{ marginTop: 25 }}>Rezultati:</h3>
          {results.length === 0 ? (
            <p style={{ color: "#666" }}>Ni rezultatov</p>
          ) : (
            <ul style={{ listStyle: "none", paddingLeft: 0 }}>
              {results.map((r) => (
                <li
                  key={r.id}
                  style={{
                    background: "#f3f8ff",
                    padding: "12px 15px",
                    marginBottom: 10,
                    borderRadius: 10,
                    borderLeft: "4px solid #007bff",
                    transition: "transform 0.2s ease",
                  }}
                >
                  <b>{r.name}</b> – {r.location}
                  <div style={{ color: "#007bff", fontWeight: "500" }}>{r.price} € / noč</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h2 style={{ textAlign: "center", marginBottom: 25, color: "#333" }}>
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
          <button
            type="submit"
            style={buttonStyle}
            onMouseEnter={(e) => hoverButton(e, true)}
            onMouseLeave={(e) => hoverButton(e, false)}
          >
            {mode === "login" ? "Prijava" : "Registracija"}
          </button>
        </form>
        <p style={{ color: message.includes("Napaka") ? "red" : "green", marginTop: 10 }}>
          {message}
        </p>
        <button
          onClick={() => setMode(mode === "login" ? "register" : "login")}
          style={{
            ...buttonStyle,
            background: "#6c757d",
            marginTop: 10,
          }}
          onMouseEnter={(e) => (e.target.style.background = "#5a6268")}
          onMouseLeave={(e) => (e.target.style.background = "#6c757d")}
        >
          {mode === "login" ? "Ustvari račun" : "Nazaj na prijavo"}
        </button>
      </div>
    </div>
  );
}

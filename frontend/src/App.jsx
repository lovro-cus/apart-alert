import { useState } from "react";
import axios from "axios";

const API_URL = "http://localhost:5000";

export default function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState("login");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const endpoint = mode === "login" ? "/login" : "/register";
      const res = await axios.post(`${API_URL}${endpoint}`, { email, password });
      setMessage(res.data.message);
    } catch (err) {
      setMessage(err.response?.data?.error || "Napaka");
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "50px auto", textAlign: "center" }}>
      <h2>{mode === "login" ? "Prijava" : "Registracija"}</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ width: "100%", marginBottom: 10, padding: 8 }}
        />
        <input
          type="password"
          placeholder="Geslo"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ width: "100%", marginBottom: 10, padding: 8 }}
        />
        <button type="submit" style={{ width: "100%", padding: 10 }}>
          {mode === "login" ? "Prijava" : "Registracija"}
        </button>
      </form>
      <p>{message}</p>
      <button onClick={() => setMode(mode === "login" ? "register" : "login")} style={{ marginTop: 10 }}>
        {mode === "login" ? "Ustvari račun" : "Nazaj na prijavo"}
      </button>
    </div>
  );
}

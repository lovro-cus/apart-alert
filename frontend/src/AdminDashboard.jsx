import { useEffect, useState } from "react";
import axios from "axios";

const API_URL = "http://localhost:5000";

export default function AdminDashboard({ adminEmail, onBack }) {
  const [overview, setOverview] = useState(null);
  const [users, setUsers] = useState([]);
  const [topFavs, setTopFavs] = useState([]);
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    const headers = { "x-admin-email": adminEmail };

    const o = await axios.get(`${API_URL}/admin/overview`, { headers });
    const u = await axios.get(`${API_URL}/admin/users`, { headers });
    const f = await axios.get(`${API_URL}/admin/favorites`, { headers });
    const a = await axios.get(`${API_URL}/admin/alerts`, { headers });

    setOverview(o.data);
    setUsers(u.data.users);
    setTopFavs(f.data.top);
    setAlerts(a.data.analytics);
  }

  if (!overview)
    return (
      <div style={{ textAlign: "center", marginTop: 60, fontSize: 22 }}>
        Nalaganje...
      </div>
    );

  const box = {
    background: "#ffffff",
    padding: "25px",
    borderRadius: "12px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
    marginBottom: "25px",
  };

  const sectionTitle = {
    fontSize: "22px",
    fontWeight: "bold",
    marginBottom: "15px",
    color: "#222",
  };

  const listItem = {
    background: "#f6f8ff",
    padding: "12px 15px",
    borderRadius: "8px",
    marginBottom: "8px",
    borderLeft: "4px solid #4a6cf7",
  };

  return (
    <div style={{ maxWidth: 900, margin: "40px auto", fontFamily: "Inter, sans-serif" }}>
      <h1 style={{ fontSize: 32, marginBottom: 10 }}>Admin Dashboard</h1>

      <button
        onClick={onBack}
        style={{
          padding: "10px 16px",
          borderRadius: "8px",
          background: "#6c757d",
          color: "white",
          border: "none",
          cursor: "pointer",
          marginBottom: 30,
        }}
      >
        Nazaj
      </button>

      {/* ----------------- POVZETEK ----------------- */}
      <div style={box}>
        <div style={sectionTitle}>Povzetek</div>

        <p>Registracije: <b>{overview.registers}</b></p>
        <p>Prijave: <b>{overview.logins}</b></p>
        <p>Iskanja: <b>{overview.searches}</b></p>

        <div style={{ marginTop: 20 }}>
          <div style={{ fontWeight: "bold", marginBottom: 8 }}>Top lokacije:</div>
          {overview.topLocations.length === 0 && <p>Ni podatkov.</p>}
          <ul style={{ listStyle: "none", padding: 0 }}>
            {overview.topLocations.map(([loc, num]) => (
              <li key={loc} style={listItem}>
                {loc} — {num} iskanj
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ----------------- UPORABNIKI ----------------- */}
      <div style={box}>
        <div style={sectionTitle}>Uporabniki</div>
        <ul style={{ listStyle: "none", padding: 0 }}>
          {users.map((u) => (
            <li key={u.email} style={listItem}>
              <b>{u.email}</b><br />
              <span>Priljubljeni: {u.favorites}</span><br />
              <span>Alerti: {u.alerts}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* ----------------- TOP FAVORITI ----------------- */}
      <div style={box}>
        <div style={sectionTitle}>Top priljubljeni apartmaji</div>
        <ul style={{ listStyle: "none", padding: 0 }}>
          {topFavs.map((f) => (
            <li key={f.apartmentId} style={listItem}>
              Apartma #{f.apartmentId} — <b>{f.count}</b> favoritov
            </li>
          ))}
        </ul>
      </div>

      {/* ----------------- ALERTI ----------------- */}
      <div style={box}>
        <div style={sectionTitle}>Alerti po lokaciji</div>
        <ul style={{ listStyle: "none", padding: 0 }}>
          {Object.entries(alerts.perLocation).map(([loc, num]) => (
            <li key={loc} style={listItem}>
              {loc} — {num} alertov
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

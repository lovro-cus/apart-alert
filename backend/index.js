import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// Inicializacija Supabase
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// ✅ Registracija uporabnika
app.post("/register", async (req, res) => {
  const { email, password } = req.body;
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) return res.status(400).json({ error: error.message });
  res.json({ message: "Uporabnik uspešno registriran", user: data.user });
});

// ✅ Prijava uporabnika
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return res.status(400).json({ error: error.message });
  res.json({ message: "Prijava uspešna", token: data.session.access_token });
});

app.listen(process.env.PORT, () =>
  console.log(`✅ Backend teče na http://localhost:${process.env.PORT}`)
);

// 🟢 Iskanje apartmajev (simulirani podatki)
app.get("/search", async (req, res) => {
  const { location, minPrice, maxPrice } = req.query;

  // Simulirani podatki
  const apartments = [
    { id: 1, name: "Apartma Center", location: "Maribor", price: 75 },
    { id: 2, name: "Apartma Pohorje", location: "Maribor", price: 90 },
    { id: 3, name: "Apartment Ljubljana View", location: "Ljubljana", price: 110 },
    { id: 4, name: "Sea Breeze", location: "Piran", price: 150 },
  ];

  // Filtriraj glede na poizvedbo
  let results = apartments;
  if (location) {
    results = results.filter(a =>
      a.location.toLowerCase().includes(location.toLowerCase())
    );
  }
  if (minPrice) results = results.filter(a => a.price >= parseInt(minPrice));
  if (maxPrice) results = results.filter(a => a.price <= parseInt(maxPrice));

  res.json({ results });
});


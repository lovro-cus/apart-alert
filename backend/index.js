import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { apartments } from "./apartments.js";


dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// Inicializacija Supabase
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// 🟢 --- SPRINT 1: REGISTRACIJA ---
app.post("/register", async (req, res) => {
  const { email, password } = req.body;
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) return res.status(400).json({ error: error.message });
  res.json({ message: "Uporabnik uspešno registriran", user: data.user });
});

// 🟢 --- SPRINT 1: PRIJAVA ---
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const { data, error } =
    await supabase.auth.signInWithPassword({ email, password });
  if (error) return res.status(400).json({ error: error.message });

  res.json({
    message: "Prijava uspešna",
    token: data.session.access_token,
    email,
  });
});

app.post("/favorite", async (req, res) => {
  const { userToken, apartmentId } = req.body;

  if (!userToken) return res.status(400).json({ error: "Manjka uporabnikov token" });

  // preverimo userja iz tokena
  const { data: user, error: userError } = await supabase.auth.getUser(userToken);

  if (userError || !user) return res.status(401).json({ error: "Neveljaven uporabnik" });

  const userId = user.user.id;

  const { error } = await supabase
    .from("favorites")
    .insert({ user_id: userId, apartment_id: apartmentId });

  if (error) return res.status(400).json({ error: error.message });

  res.json({ message: "Dodano med priljubljene" });
});




// 🟢 --- SPRINT 2: ISKANJE APARTMAJEV ---
app.get("/search", (req, res) => {
  const { location, minPrice, maxPrice } = req.query;

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

app.post("/favorite", async (req, res) => {
  const { userToken, apartmentId } = req.body;

  if (!userToken) return res.status(400).json({ error: "Manjka uporabnikov token" });

  // preverimo userja iz tokena
  const { data: user, error: userError } = await supabase.auth.getUser(userToken);

  if (userError || !user) return res.status(401).json({ error: "Neveljaven uporabnik" });

  const userId = user.user.id;

  const { error } = await supabase
    .from("favorites")
    .insert({ user_id: userId, apartment_id: apartmentId });

  if (error) return res.status(400).json({ error: error.message });

  res.json({ message: "Dodano med priljubljene" });
});


app.get("/sort", (req, res) => {
  const { by } = req.query;

  let sorted = [...apartments];

  if (by === "price") {
    sorted.sort((a, b) => a.price - b.price);
  } 
  else if (by === "rating") {
    sorted.sort((a, b) => b.rating - a.rating);
  } 
  else if (by === "distance") {
    sorted.sort((a, b) => a.distance - b.distance);
  }

  res.json({ results: sorted });
});

app.get("/favorites", async (req, res) => {
  const userToken = req.headers.authorization?.replace("Bearer ", "");

  if (!userToken) return res.status(400).json({ error: "Manjka token" });

  const { data: user, error: userError } = await supabase.auth.getUser(userToken);

  if (userError || !user) return res.status(401).json({ error: "Neveljaven uporabnik" });

  const userId = user.user.id;

  const { data, error } = await supabase
    .from("favorites")
    .select("apartment_id")
    .eq("user_id", userId);

  if (error) return res.status(400).json({ error: error.message });

  res.json({ favorites: data.map((f) => f.apartment_id) });
});



app.get("/favorites/:user", async (req, res) => {
  const { user } = req.params;

  const { data, error } = await supabase
    .from("favorites")
    .select("apartment_id")
    .eq("user_email", user);

  if (error) return res.status(400).json({ error: error.message });

  // Extract list of IDs
  const ids = data.map((f) => f.apartment_id);

  // Match with apartment dataset
  const userFavorites = apartments.filter((apt) => ids.includes(apt.id));

  res.json({ favorites: userFavorites });
});
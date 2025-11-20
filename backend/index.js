import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { apartments } from "./apartments.js";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// -----------------------------------------------
// KONSTANTE
// -----------------------------------------------
const ADMIN_EMAIL = "culjo41@gmail.com";

// -----------------------------------------------
// INIT SUPABASE
// -----------------------------------------------
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// -----------------------------------------------
// ADMIN MIDDLEWARE
// -----------------------------------------------
function requireAdmin(req, res, next) {
  const userEmail = req.headers["x-admin-email"];
  if (userEmail !== ADMIN_EMAIL) {
    return res.status(403).json({ error: "Dostop zavrnjen" });
  }
  return next();
}

// -----------------------------------------------
// ADMIN: OVERVIEW
// -----------------------------------------------
app.get("/admin/overview", requireAdmin, async (req, res) => {
  const { data: metrics } = await supabase
    .from("metrics_log")
    .select("*")
    .order("created_at", { ascending: false });

  const logins = metrics.filter(x => x.event_type === "login").length;
  const registers = metrics.filter(x => x.event_type === "register").length;
  const searches = metrics.filter(x => x.event_type === "search");

  const topLocations = {};
  searches.forEach(s => {
    const loc = s.event_data.location?.toLowerCase();
    if (!loc) return;
    if (!topLocations[loc]) topLocations[loc] = 0;
    topLocations[loc]++;
  });

  const sortedLocations = Object.entries(topLocations)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  res.json({
    logins,
    registers,
    searches: searches.length,
    topLocations: sortedLocations,
    lastEvents: metrics.slice(0, 10),
  });
});

// -----------------------------------------------
// ADMIN: USERS
// -----------------------------------------------
app.get("/admin/users", requireAdmin, async (req, res) => {
  const { data } = await supabase.auth.admin.listUsers();
  const authUsers = data.users;

  const { data: favs } = await supabase.from("favorites").select("*");
  const { data: alerts } = await supabase.from("alerts").select("*");

  const enriched = authUsers.map((u) => ({
    email: u.email,
    created_at: u.created_at,
    favorites: favs.filter(f => f.user_id === u.id).length,
    alerts: alerts.filter(a => a.user_id === u.id).length,
  }));

  res.json({ users: enriched });
});

// -----------------------------------------------
// ADMIN: FAVORITES
// -----------------------------------------------
app.get("/admin/favorites", requireAdmin, async (req, res) => {
  const { data } = await supabase.from("favorites").select("*");

  const countPerApartment = {};
  data.forEach(f => {
    if (!countPerApartment[f.apartment_id]) countPerApartment[f.apartment_id] = 0;
    countPerApartment[f.apartment_id]++;
  });

  const top = Object.entries(countPerApartment)
    .sort((a, b) => b[1] - a[1])
    .map(([id, count]) => ({
      apartmentId: Number(id),
      count,
    }))
    .slice(0, 10);

  res.json({ top });
});

// -----------------------------------------------
// ADMIN: ALERTS ANALYTICS
// -----------------------------------------------
app.get("/admin/alerts", requireAdmin, async (req, res) => {
  const { data } = await supabase.from("alerts").select("*");

  const perLocation = {};
  data.forEach(a => {
    if (!perLocation[a.location]) perLocation[a.location] = 0;
    perLocation[a.location]++;
  });

  res.json({
    alerts: data,
    analytics: { perLocation },
  });
});

// -----------------------------------------------
// REGISTER
// -----------------------------------------------
app.post("/register", async (req, res) => {
  const { email, password } = req.body;

  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) return res.status(400).json({ error: error.message });

  await supabase.from("metrics_log").insert({
    event_type: "register",
    event_data: { email },
  });

  res.json({ message: "Uporabnik uspešno registriran", user: data.user });
});

// -----------------------------------------------
// LOGIN
// -----------------------------------------------
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const { data, error } =
      await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      await supabase.from("metrics_log").insert({
        event_type: "login_failed",
        event_data: { email, reason: error.message },
      });
      return res.status(400).json({ error: error.message });
    }

    await supabase.from("metrics_log").insert({
      event_type: "login",
      event_data: { email },
    });

    res.json({
      message: "Prijava uspešna",
      token: data.session.access_token,
      email,
    });

  } catch (err) {
    await supabase.from("error_logs").insert({
      error_message: err.message,
      stacktrace: err.stack,
      route: "/login",
    });

    return res.status(500).json({ error: "Nepričakovana napaka pri prijavi" });
  }
});

// -----------------------------------------------
// SEARCH
// -----------------------------------------------
app.get("/search", async (req, res) => {
  const { location, minPrice, maxPrice } = req.query;

  try {
    await supabase.from("metrics_log").insert({
      event_type: "search",
      event_data: { location, minPrice, maxPrice },
    });

    let results = apartments;

    if (location) {
      results = results.filter(a =>
        a.location.toLowerCase().includes(location.toLowerCase())
      );
    }

    if (minPrice) results = results.filter(a => a.price >= parseInt(minPrice));
    if (maxPrice) results = results.filter(a => a.price <= parseInt(maxPrice));

    return res.json({ results });

  } catch (err) {
    await supabase.from("error_logs").insert({
      error_message: err.message,
      stacktrace: err.stack,
      route: "/search",
    });

    return res.status(500).json({ error: "Napaka pri iskanju" });
  }
});

// -----------------------------------------------
// FAVORITE ADD
// -----------------------------------------------
app.post("/favorite", async (req, res) => {
  const { userToken, apartmentId } = req.body;

  if (!userToken) return res.status(400).json({ error: "Manjka token" });

  const { data: user, error } = await supabase.auth.getUser(userToken);
  if (error || !user) return res.status(401).json({ error: "Neveljaven token" });

  const userId = user.user.id;

  const { error: favErr } = await supabase
    .from("favorites")
    .insert({ user_id: userId, apartment_id: apartmentId });

  if (favErr) return res.status(400).json({ error: favErr.message });

  res.json({ message: "Dodano med priljubljene" });
});

// -----------------------------------------------
// FAVORITES GET
// -----------------------------------------------
app.get("/favorites", async (req, res) => {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) return res.status(400).json({ error: "Manjka token" });

  const { data: user, error } = await supabase.auth.getUser(token);
  if (error || !user) return res.status(401).json({ error: "Neveljaven token" });

  const userId = user.user.id;

  const { data, error: favErr } = await supabase
    .from("favorites")
    .select("apartment_id")
    .eq("user_id", userId);

  if (favErr) return res.status(400).json({ error: favErr.message });

  const ids = data.map(f => f.apartment_id);
  const detailed = apartments.filter(a => ids.includes(a.id));

  res.json({ favorites: detailed });
});

// -----------------------------------------------
// CREATE ALERT
// -----------------------------------------------
app.post("/create-alert", async (req, res) => {
  const { userToken, location, minPrice, maxPrice } = req.body;

  if (!userToken) return res.status(400).json({ error: "Manjka token" });

  const { data: user, error } = await supabase.auth.getUser(userToken);
  if (error || !user) return res.status(401).json({ error: "Neveljaven token" });

  const userId = user.user.id;

  const { error: alertErr } = await supabase.from("alerts").insert({
    user_id: userId,
    location,
    min_price: minPrice,
    max_price: maxPrice,
    last_sent: null,
  });

  if (alertErr) return res.status(400).json({ error: alertErr.message });

  res.json({ message: "Obvestilo ustvarjeno" });
});




// -----------------------------------------------
// CHANGE PASSWORD
// -----------------------------------------------
app.post("/change-password", async (req, res) => {
  const { userToken, newPassword } = req.body;

  if (!userToken || !newPassword) {
    return res.status(400).json({ error: "Manjka token ali novo geslo" });
  }

  try {
    // kdo je ta user?
    const { data, error } = await supabase.auth.getUser(userToken);
    if (error || !data.user) {
      return res.status(401).json({ error: "Neveljaven token" });
    }
    const userId = data.user.id;

    console.log(user.user.id + " \n " + user.user.userEmail)
    // sprememba gesla preko admin API (ker si na serverju)
    const { error: updErr } = await supabase.auth.admin.updateUserById(userId, {
      password: newPassword,
      
    });

    if (updErr) {
      return res.status(400).json({ error: updErr.message });
    }

    await supabase.from("metrics_log").insert({
      event_type: "password_change",
      event_data: { user_id: userId },
    });

    res.json({ message: "Geslo uspešno spremenjeno." });
  } catch (err) {
    await supabase.from("error_logs").insert({
      error_message: err.message,
      stacktrace: err.stack,
      route: "/change-password",
    });
    res.status(500).json({ error: "Napaka pri spremembi gesla" });
  }
});


// -----------------------------------------------
// DELETE ACCOUNT
// -----------------------------------------------
app.post("/delete-account", async (req, res) => {
  const { userToken } = req.body;

  if (!userToken) {
    return res.status(400).json({ error: "Manjka token" });
  }

  try {
    // kdo je ta user?
    const { data: user, error: userErr } = await supabase.auth.getUser(userToken);
    if (userErr || !user) {
      return res.status(401).json({ error: "Neveljaven token" });
    }

    const userId = user.user.id;

    // počistimo njegove podatke v naših tabelah
    await supabase.from("favorites").delete().eq("user_id", userId);
    await supabase.from("alerts").delete().eq("user_id", userId);

    // izbrišemo uporabnika iz auth
    const { error: delErr } = await supabase.auth.admin.deleteUser(userId);
    if (delErr) {
      return res.status(400).json({ error: delErr.message });
    }

    await supabase.from("metrics_log").insert({
      event_type: "account_deleted",
      event_data: { user_id: userId },
    });

    res.json({ message: "Račun je bil izbrisan." });
  } catch (err) {
    await supabase.from("error_logs").insert({
      error_message: err.message,
      stacktrace: err.stack,
      route: "/delete-account",
    });
    res.status(500).json({ error: "Napaka pri brisanju računa" });
  }
});



// -----------------------------------------------
app.listen(5000, () =>
  console.log("Backend running at http://localhost:5000")
);

import { createClient } from "@supabase/supabase-js";
import { apartments } from "./apartments.js";
import nodemailer from "nodemailer";

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// email pošiljanje
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  }
});

async function checkAlerts() {
  const { data: alerts } = await supabase.from("alerts").select("*");

  for (const alert of alerts) {
    const matches = apartments.filter(a => {
      return (
        a.location.toLowerCase().includes(alert.location.toLowerCase()) &&
        a.price >= alert.min_price &&
        a.price <= alert.max_price
      );
    });

    if (matches.length === 0) continue;

    // pošlji email
    const { data: user } = await supabase
      .from("auth.users")
      .select("email")
      .eq("id", alert.user_id)
      .single();

    await transporter.sendMail({
      from: process.env.MAIL_USER,
      to: user.email,
      subject: "Nova ujemanja za tvoj iskalni filter!",
      text: `Našli smo ${matches.length} novih apartmajev.`,
    });

    // posodobi last_sent
    await supabase
      .from("alerts")
      .update({ last_sent: new Date() })
      .eq("id", alert.id);
  }
}

checkAlerts();

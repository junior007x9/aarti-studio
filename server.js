import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import client, { setupDatabase } from "./database.js";

const app = express();
const port = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- MIDDLEWARES (CONFIGURAÇÃO) ---
app.use(cors());
// AUMENTAMOS O LIMITE PARA 10MB PARA ACEITAR IMAGENS
app.use(express.json({ limit: '10mb' })); 
app.use(express.static(path.join(__dirname, "public")));

// Inicializa banco
setupDatabase();

// --- ROTA DE LOGIN ---
app.post("/api/admin/login", (req, res) => {
  const { password } = req.body;
  const adminPass = "admin123"; // Sua senha

  if (password && password.trim() === adminPass) {
    res.json({ success: true });
  } else {
    res.status(401).json({ success: false });
  }
});

// --- ROTAS DO SITE ---
app.get("/api/services", async (req, res) => {
  try {
    const result = await client.execute("SELECT * FROM services_v2 ORDER BY id DESC");
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/contact", async (req, res) => {
  const { name, phone, message } = req.body;
  try {
    await client.execute({
      sql: "INSERT INTO contacts (name, phone, message) VALUES (?, ?, ?)",
      args: [name, phone, message],
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- ROTAS DO ADMIN ---
app.get("/api/admin/messages", async (req, res) => {
  try {
    const result = await client.execute("SELECT * FROM contacts ORDER BY created_at DESC");
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/admin/services", async (req, res) => {
  const { name, description, price, icon, image_url } = req.body;
  try {
    await client.execute({
      sql: "INSERT INTO services_v2 (name, description, price, icon, image_url) VALUES (?, ?, ?, ?, ?)",
      args: [name, description, price, icon, image_url],
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/admin/services/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await client.execute({
      sql: "DELETE FROM services_v2 WHERE id = ?",
      args: [id],
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "admin.html"));
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

if (process.env.NODE_ENV !== 'production') {
    app.listen(port, () => {
      console.log(`🚀 AARTI STUDIO rodando em http://localhost:${port}`);
    });
}
  
export default app;
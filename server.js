import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import client, { setupDatabase } from "./database.js";

const app = express();
const port = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Inicializa banco
setupDatabase();

// --- ROTAS ---

// 1. Listar Serviços (Agora da tabela V2 com imagens)
app.get("/api/services", async (req, res) => {
  try {
    const result = await client.execute("SELECT * FROM services_v2 ORDER BY id DESC");
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. Salvar Contato
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

// 3. Admin - Listar Mensagens
app.get("/api/admin/messages", async (req, res) => {
  try {
    const result = await client.execute("SELECT * FROM contacts ORDER BY created_at DESC");
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Entregar Frontend
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Entregar Painel Admin (Se quiser manter)
app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "admin.html"));
});

if (process.env.NODE_ENV !== 'production') {
  app.listen(port, () => {
    console.log(`🚀 AARTI STUDIO rodando em http://localhost:${port}`);
  });
}

// Necessário para a Vercel:
export default app;
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

// --- ROTAS PÚBLICAS ---

// 1. Listar Serviços (Para o site)
app.get("/api/services", async (req, res) => {
  try {
    const result = await client.execute("SELECT * FROM services_v2 ORDER BY id DESC");
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. Salvar Contato (Formulário)
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

// --- ROTAS DO PAINEL ADMIN ---

// 3. Ver Mensagens (Leads)
app.get("/api/admin/messages", async (req, res) => {
  try {
    const result = await client.execute("SELECT * FROM contacts ORDER BY created_at DESC");
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 4. Adicionar Novo Serviço (Agora com Imagem!)
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

// 5. Deletar Serviço
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

// Rota para entregar o arquivo do Admin
app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "admin.html"));
});

// Rota Principal
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Configuração para Vercel ou Local
if (process.env.NODE_ENV !== 'production') {
    app.listen(port, () => {
      console.log(`🚀 AARTI STUDIO rodando em http://localhost:${port}`);
      console.log(`🔐 Painel Admin em http://localhost:${port}/admin`);
    });
}
  
export default app;
import { createClient } from "@libsql/client";
import dotenv from "dotenv";

dotenv.config();

const client = createClient({
  url: process.env.TURSO_DB_URL,
  authToken: process.env.TURSO_DB_TOKEN,
});

export const setupDatabase = async () => {
  try {
    console.log("🔄 Verificando banco de dados...");

    // 1. Tabela de Serviços V2 (Com Imagens e Links)
    // Usamos 'v2' para garantir que ele crie a nova estrutura com imagens
    await client.execute(`
      CREATE TABLE IF NOT EXISTS services_v2 (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        price TEXT,
        icon TEXT,
        image_url TEXT
      )
    `);

    // 2. Tabela de Contatos
    await client.execute(`
      CREATE TABLE IF NOT EXISTS contacts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        phone TEXT,
        message TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 3. Popular com dados iniciais (Se estiver vazio)
    const result = await client.execute("SELECT COUNT(*) as count FROM services_v2");
    
    if (result.rows[0].count === 0) {
      console.log("🌱 Inserindo serviços com Imagens e Valores...");
      
      const services = [
        { 
            name: "Logomarcas Premium", 
            desc: "Identidade visual completa, manual da marca e variações.", 
            price: "R$ 450,00", 
            icon: "fa-pen-nib",
            img: "https://images.unsplash.com/photo-1626785774573-4b799314346d?auto=format&fit=crop&w=800&q=80"
        },
        { 
            name: "Cartões Interativos", 
            desc: "Cartão de visita digital com botões clicáveis (PDF/Link).", 
            price: "R$ 120,00", 
            icon: "fa-id-card",
            img: "https://images.unsplash.com/photo-1596526131083-e8c633c948d2?auto=format&fit=crop&w=800&q=80" 
        },
        { 
            name: "Social Media Pack", 
            desc: "Pacote com 10 artes profissionais para feed/stories.", 
            price: "R$ 350,00", 
            icon: "fa-hashtag",
            img: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&w=800&q=80" 
        },
        { 
            name: "Edição de Vídeo (Reels)", 
            desc: "Edição dinâmica com legendas e transições.", 
            price: "R$ 80,00 / un", 
            icon: "fa-video",
            img: "https://images.unsplash.com/photo-1574717432729-28d8b6727210?auto=format&fit=crop&w=800&q=80" 
        },
        { 
            name: "Ensaios Fotográficos", 
            desc: "Sessão externa ou interna com tratamento incluso.", 
            price: "Sob Consulta", 
            icon: "fa-camera",
            img: "https://images.unsplash.com/photo-1554048612-387768052bf7?auto=format&fit=crop&w=800&q=80" 
        }
      ];

      for (const s of services) {
        await client.execute({
          sql: "INSERT INTO services_v2 (name, description, price, icon, image_url) VALUES (?, ?, ?, ?, ?)",
          args: [s.name, s.desc, s.price, s.icon, s.img],
        });
      }
    }

    console.log("✅ Banco de dados atualizado com sucesso!");
  } catch (error) {
    console.error("❌ Erro no banco:", error);
  }
};

export default client;
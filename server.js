import express from "express";
import axios from "axios";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { InferenceClient } from "@huggingface/inference";
import { JSDOM } from "jsdom";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Cargar .env.local en desarrollo, .env en producción
const envFile = process.env.NODE_ENV === "production" ? ".env" : ".env.local";
const envPath = path.join(__dirname, "..", envFile);
dotenv.config({ path: envPath });

console.log("🔍 Cargando desde:", envPath);
console.log("✅ Token HF:", process.env.HUGGINGFACE_API_KEY ? "Cargado" : "❌ NO CARGADO");
console.log("✅ Token OpenAI:", process.env.OPENAI_API_KEY ? "Cargado" : "❌ NO CARGADO");
console.log("🤖 Proveedor:", process.env.AI_PROVIDER);

const app = express();
app.use(express.static(__dirname));
app.use(express.json());

const API_PROVIDER = process.env.AI_PROVIDER || "openai";

// ------------------------------------------------------
// CARGAR CONTENIDO DE TU PORTFOLIO COMO CONTEXTO
// ------------------------------------------------------
let PORTFOLIO_CONTEXT = "No se pudo cargar el portfolio.";

async function loadPortfolio() {
  try {
    console.log("🌐 Cargando contenido del portfolio...");

    const html = await axios.get("https://nacho-ag82.github.io/CV").then(r => r.data);
    const dom = new JSDOM(html);
    const text = dom.window.document.body.textContent;

    PORTFOLIO_CONTEXT = `
Eres un asistente IA que responde sobre el perfil profesional de Ignacio Aguirre.
Usa esta información extraída de su portfolio web:

${text}

Responde de forma concisa, profesional y basada en estos datos.
    `;

    console.log("✅ Portfolio cargado correctamente.");
  } catch (error) {
    console.error("❌ Error cargando portfolio:", error.message);
  }
}

await loadPortfolio();

// ------------------------------------------------------
// HUGGING FACE (NUEVO CLIENTE OFICIAL)
// ------------------------------------------------------
const hf = new InferenceClient(process.env.HUGGINGFACE_API_KEY);

async function callHuggingFace(userMessage, history = []) {
  try {
    console.log("📨 Llamando a Hugging Face...");

    const response = await hf.chatCompletion({
      model: "meta-llama/Llama-3.2-1B-Instruct",
      messages: [
        { role: "system", content: PORTFOLIO_CONTEXT },
        ...history.slice(-6),
        { role: "user", content: userMessage },
      ],
      max_tokens: 200,
      temperature: 0.7,
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error("❌ HF Error:", error.message);
    throw error;
  }
}



// ------------------------------------------------------
// ENDPOINT PRINCIPAL
// ------------------------------------------------------
app.post("/api/chat", async (req, res) => {
  try {
    const { message, history = [] } = req.body;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({ error: "Mensaje vacío" });
    }

    console.log("📨 Mensaje recibido:", message);

    let response;

    switch (API_PROVIDER) {
      case "huggingface":
        response = await callHuggingFace(message, history);
        break;
    }

    res.json({ response });
  } catch (error) {
    console.error("❌ Error en /api/chat:", error.message);
    res.status(500).json({ error: "Usando respuestas locales" });
  }
});

// ------------------------------------------------------
// 6. SERVIDOR
// ------------------------------------------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n🚀 Servidor en http://localhost:${PORT}`);
  console.log(`Proveedor: ${API_PROVIDER}\n`);
});

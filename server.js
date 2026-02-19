import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(express.static(__dirname));
app.use(express.json());

const API_PROVIDER = process.env.AI_PROVIDER || 'openai';

// Contexto del perfil de Ignacio
const PROFILE_CONTEXT = `Eres un asistente IA que responde sobre el perfil profesional de Ignacio Aguirre:
- Desarrollador Full Stack con especialización en JavaScript
- Experiencia en Angular, Laravel, Java
- Tech Lead Junior, Analista Técnico, Consultor Tecnológico
- Habilidades: Liderazgo, comunicación, resolución de problemas
- Educación: Desarrollo de Aplicaciones Web (2025)
- Idiomas: Español (Nativo), Inglés (Fluido)
- Ubicación: Sevilla, España

Responde de forma concisa y profesional sobre su experiencia y habilidades.`;

async function callOpenAI(userMessage) {
  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: PROFILE_CONTEXT },
          { role: 'user', content: userMessage }
        ],
        max_tokens: 150,
        temperature: 0.7
      },
      {
        headers: { 'Authorization': `Bearer ${process.env.OPENAI_API_KEY}` }
      }
    );
    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI Error:', error.message);
    throw error;
  }
}

async function callHuggingFace(userMessage) {
  try {
    const response = await axios.post(
      'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.1',
      { inputs: `${PROFILE_CONTEXT}\n\nUsuario: ${userMessage}\n\nAsistente:` },
      {
        headers: { 'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}` }
      }
    );
    return response.data[0].generated_text.split('Asistente:')[1]?.trim() || 'Disculpa, no pude procesar tu pregunta.';
  } catch (error) {
    console.error('Hugging Face Error:', error.message);
    throw error;
  }
}

async function callGemini(userMessage) {
  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [{
          parts: [{
            text: `${PROFILE_CONTEXT}\n\nUsuario: ${userMessage}`
          }]
        }]
      }
    );
    return response.data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('Gemini Error:', error.message);
    throw error;
  }
}

app.post('/api/chat', async (req, res) => {
  try {
    const { message, language } = req.body;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({ error: 'Mensaje vacío' });
    }

    let response;

    switch (API_PROVIDER) {
      case 'huggingface':
        response = await callHuggingFace(message);
        break;
      case 'gemini':
        response = await callGemini(message);
        break;
      case 'openai':
      default:
        response = await callOpenAI(message);
    }

    res.json({ response });
  } catch (error) {
    res.status(500).json({ error: 'Error procesando la solicitud' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en puerto ${PORT}`);
  console.log(`Usando proveedor: ${API_PROVIDER}`);
});

# Portfolio Ignacio Aguirre - Con Asistente IA

## Instalación del Asistente IA

### Opción 1: Con servidor Backend (Recomendado)

1. **Instalar dependencias:**
```bash
npm install
```

2. **Configurar variables de entorno:**
```bash
cp .env.example .env
```

3. **Editar `.env` con tu API key:**
```
# Elige uno de estos proveedores:

# OpenAI (Recomendado - GPT-3.5)
OPENAI_API_KEY=sk-...
AI_PROVIDER=openai

# O Hugging Face (Gratuito)
HUGGINGFACE_API_KEY=hf_...
AI_PROVIDER=huggingface

# O Google Gemini
GEMINI_API_KEY=AIzaSy...
AI_PROVIDER=gemini
```

4. **Iniciar servidor:**
```bash
npm start
```

5. **Abrir en navegador:**
```
http://localhost:3000
```

### Opción 2: Sin servidor (Fallback local)

Solo abre `index.html` en el navegador. El chat responderá con respuestas predefinidas locales.

## Proveedores de IA Soportados

### OpenAI (Recomendado)
- Modelo: GPT-3.5 Turbo
- Costo: ~$0.0005 por mensaje
- Calidad: Excelente
- Registro: https://platform.openai.com

### Hugging Face
- Modelo: Mistral-7B
- Costo: Gratuito
- Calidad: Muy buena
- Registro: https://huggingface.co

### Google Gemini
- Modelo: Gemini Pro
- Costo: Gratuito (límite: 60 req/min)
- Calidad: Excelente
- Registro: https://ai.google.dev

## Estructura de Archivos

```
cv/
├── index.html           # HTML principal
├── styles.css           # Estilos
├── ai-module.js         # Lógica del chat (cliente)
├── server.js            # Backend (servidor)
├── translations.js      # Traducciones i18n
├── main.js             # Scripts principales
├── package.json        # Dependencias
├── .env.example        # Variables de entorno
└── README.md           # Este archivo
```

## Características

✅ Asistente IA bilingüe (ES/EN)
✅ Conexión con múltiples APIs de IA
✅ Fallback local si el servidor no está disponible
✅ Interfaz responsiva y accesible
✅ Carga asíncrona de respuestas
✅ Tema oscuro/claro

## Solución de Problemas

**"Error: No se puede conectar al servidor"**
- El chat funcionará en modo local con respuestas predefinidas

**"Error de API Key"**
- Verifica que tu clave API sea correcta en `.env`
- Comprueba los permisos de tu cuenta en el proveedor

**"Rate limit exceeded"**
- Espera unos minutos o sube de plan en tu proveedor IA

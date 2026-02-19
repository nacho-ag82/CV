// Fallback local si el servidor no está disponible
const aiKnowledgeBase = {
  es: {
    skills: [
      'JavaScript, Angular, HTML, CSS, Bootstrap',
      'Accesibilidad, Performance, Responsive Design',
      'Java, Laravel, APIs REST, SQL',
      'Git, Agile, Scrum'
    ],
    experience: [
      'YMANT: Instalador de Sistemas (Sept-Dic 2025)',
      'Outlier: Entrenador de IA (Mar 2025 - Actualidad)',
      'Quantum Solutions: Desarrollador Web / Analista Funcional (Mar-Jul 2025)'
    ],
    softSkills: [
      'Liderazgo de equipos',
      'Comunicación efectiva',
      'Resolución de problemas',
      'Pensamiento analítico',
      'Trato con cliente'
    ],
    objective: 'Tech Lead Junior, Analista Técnico o Consultor Tecnológico',
    education: 'Desarrollo de Aplicaciones Web (2025), Bachillerato (2020)',
    languages: 'Español (Nativo), Inglés (Fluido)'
  },
  en: {
    skills: [
      'JavaScript, Angular, HTML, CSS, Bootstrap',
      'Accessibility, Performance, Responsive Design',
      'Java, Laravel, REST APIs, SQL',
      'Git, Agile, Scrum'
    ],
    experience: [
      'YMANT: Systems Installer (Sept-Dec 2025)',
      'Outlier: AI Trainer (Mar 2025 - Present)',
      'Quantum Solutions: Web Developer / Functional Analyst (Mar-Jul 2025)'
    ],
    softSkills: [
      'Team leadership',
      'Effective communication',
      'Problem solving',
      'Analytical thinking',
      'Client relations'
    ],
    objective: 'Junior Tech Lead, Technical Analyst or Technology Consultant',
    education: 'Web Applications Development (2025), High School (2020)',
    languages: 'Spanish (Native), English (Fluent)'
  }
};

function getLocalAIResponse(question, language = 'es') {
  const kb = aiKnowledgeBase[language] || aiKnowledgeBase.es;
  const q = question.toLowerCase();

  const responses = {
    es: {
      skills: () => `Mis habilidades principales son: ${kb.skills.join(', ')}.`,
      experience: () => `Mi experiencia incluye: ${kb.experience.join(', ')}.`,
      softskills: () => `Habilidades blandas: ${kb.softSkills.join(', ')}.`,
      objective: () => `Busco un rol como: ${kb.objective}.`,
      education: () => `Educación: ${kb.education}.`,
      languages: () => `Idiomas: ${kb.languages}.`,
      default: () => 'Puedo responder sobre habilidades técnicas, experiencia, educación e idiomas. ¿Qué deseas saber?'
    },
    en: {
      skills: () => `My main skills are: ${kb.skills.join(', ')}.`,
      experience: () => `My experience includes: ${kb.experience.join(', ')}.`,
      softskills: () => `Soft skills: ${kb.softSkills.join(', ')}.`,
      objective: () => `I'm looking for a role as: ${kb.objective}.`,
      education: () => `Education: ${kb.education}.`,
      languages: () => `Languages: ${kb.languages}.`,
      default: () => 'I can answer about technical skills, experience, education and languages. What would you like to know?'
    }
  };

  const langResponses = responses[language] || responses.es;

  if (q.includes('habilidad') || q.includes('skill') || q.includes('técnic')) return langResponses.skills();
  if (q.includes('experiencia') || q.includes('experience') || q.includes('trabajo') || q.includes('job')) return langResponses.experience();
  if (q.includes('blanda') || q.includes('soft') || q.includes('liderazgo') || q.includes('leadership')) return langResponses.softskills();
  if (q.includes('objetivo') || q.includes('objective') || q.includes('busco') || q.includes('looking')) return langResponses.objective();
  if (q.includes('educación') || q.includes('education') || q.includes('estudi') || q.includes('study')) return langResponses.education();
  if (q.includes('idioma') || q.includes('language')) return langResponses.languages();

  return langResponses.default();
}

document.addEventListener('DOMContentLoaded', () => {
  const chatInput = document.getElementById('ai-input');
  const sendBtn = document.getElementById('ai-send');
  const chatBox = document.getElementById('ai-chat');

  function addMessage(text, isUser, isLoading = false) {
    const msgDiv = document.createElement('div');
    msgDiv.className = isUser ? 'ai-message user' : 'ai-message ai-bot';
    if (isLoading) msgDiv.classList.add('loading');
    msgDiv.textContent = text;
    chatBox.appendChild(msgDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
    return msgDiv;
  }

  async function sendMessage() {
    const input = chatInput.value.trim();
    if (!input) return;

    addMessage(input, true);
    chatInput.value = '';
    sendBtn.disabled = true;

    const lang = document.documentElement.getAttribute('data-lang') || 'es';
    const loadingMsg = addMessage('⏳ Procesando...', false, true);

    try {
      // Intentar conectar con el servidor
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input, language: lang })
      });

      if (response.ok) {
        const data = await response.json();
        loadingMsg.remove();
        setTimeout(() => addMessage(data.response, false), 300);
      } else {
        throw new Error('Server error');
      }
    } catch (error) {
      // Fallback a respuestas locales si el servidor no está disponible
      console.log('Usando modo local (servidor no disponible)');
      loadingMsg.remove();
      const localResponse = getLocalAIResponse(input, lang);
      setTimeout(() => addMessage(localResponse, false), 300);
    } finally {
      sendBtn.disabled = false;
      chatInput.focus();
    }
  }

  sendBtn.addEventListener('click', sendMessage);
  chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !sendBtn.disabled) sendMessage();
  });
});

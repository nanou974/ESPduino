class GroqAssistant {
  constructor(config = {}) {
    this.vercelUrl = config.vercelUrl || 'https://espduino-2paa204n9-bg-3d81.vercel.app';
    this.isOpen = false;
    this.messages = [];
    this.isLoading = false;
    this.init();
  }

  init() {
    this.createWidget();
    this.attachEventListeners();
    this.loadMessages();
  }

  createWidget() {
    const widgetContainer = document.createElement('div');
    widgetContainer.id = 'groq-widget-container';
    widgetContainer.innerHTML = `
      <div id="groq-bubble" class="groq-bubble">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"/>
        </svg>
      </div>

      <div id="groq-chat-window" class="groq-chat-window hidden">
        <div class="groq-header">
          <div class="groq-header-content">
            <span>🤖 ESP32 Assistant</span>
          </div>
          <button id="groq-close-btn" class="groq-close-btn">✕</button>
        </div>

        <div id="groq-messages" class="groq-messages">
          <div class="groq-message bot-message">
            <div class="groq-message-content">
              Salut! 👋 Je suis ton assistant IA pour l'ESP32 Academy. Pose-moi tes questions sur Arduino, électronique, développement ou impression 3D!
            </div>
          </div>
        </div>

        <div class="groq-input-container">
          <input
            id="groq-input"
            type="text"
            placeholder="Pose une question..."
            class="groq-input"
            autocomplete="off"
          />
          <button id="groq-send-btn" class="groq-send-btn">→</button>
        </div>
      </div>
    `;

    document.body.appendChild(widgetContainer);
  }

  attachEventListeners() {
    const bubble = document.getElementById('groq-bubble');
    const chatWindow = document.getElementById('groq-chat-window');
    const closeBtn = document.getElementById('groq-close-btn');
    const sendBtn = document.getElementById('groq-send-btn');
    const input = document.getElementById('groq-input');

    bubble.addEventListener('click', () => this.toggleChat());
    closeBtn.addEventListener('click', () => this.toggleChat());

    sendBtn.addEventListener('click', () => this.sendMessage());
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.sendMessage();
      }
    });
  }

  toggleChat() {
    const chatWindow = document.getElementById('groq-chat-window');
    const bubble = document.getElementById('groq-bubble');

    this.isOpen = !this.isOpen;

    if (this.isOpen) {
      chatWindow.classList.remove('hidden');
      bubble.classList.add('active');
      document.getElementById('groq-input').focus();
    } else {
      chatWindow.classList.add('hidden');
      bubble.classList.remove('active');
    }
  }

  async sendMessage() {
    const input = document.getElementById('groq-input');
    const message = input.value.trim();

    if (!message || this.isLoading) return;

    this.addMessage(message, 'user');
    input.value = '';

    this.isLoading = true;

    try {
      const response = await fetch(`${this.vercelUrl}/api/groq-assistant`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erreur API');
      }

      const data = await response.json();
      this.addMessage(data.message, 'bot');
      this.saveMessages();

    } catch (error) {
      console.error('Erreur:', error);
      this.addMessage(`❌ Erreur: ${error.message}`, 'error');
    } finally {
      this.isLoading = false;
    }
  }

  addMessage(content, sender) {
    const messagesContainer = document.getElementById('groq-messages');
    const messageDiv = document.createElement('div');

    messageDiv.className = `groq-message ${sender}-message`;

    const contentDiv = document.createElement('div');
    contentDiv.className = 'groq-message-content';
    contentDiv.textContent = content;

    messageDiv.appendChild(contentDiv);
    messagesContainer.appendChild(messageDiv);

    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    this.messages.push({ content, sender, timestamp: new Date() });
  }

  saveMessages() {
    localStorage.setItem('groq-messages', JSON.stringify(this.messages));
  }

  loadMessages() {
    const saved = localStorage.getItem('groq-messages');
    if (saved) {
      this.messages = JSON.parse(saved);
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.groqAssistant = new GroqAssistant({
    vercelUrl: 'https://espduino-2paa204n9-bg-3d81.vercel.app'
  });
});

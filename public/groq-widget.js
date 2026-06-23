// Groq API Widget - ESPduino
(function() {
    const GROQ_API_KEY = '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';
    const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

    // Créer le bouton flottant
    function createChatButton() {
        const button = document.createElement('button');
        button.className = 'groq-chat-button';
        button.innerHTML = '💬';
        button.title = 'Assistant ESPduino';
        button.onclick = openChatWindow;
        document.body.appendChild(button);
    }

    // Créer la fenêtre de chat
    function openChatWindow() {
        if (document.getElementById('groq-chat-window')) {
            return; // Déjà ouverte
        }

        const chatWindow = document.createElement('div');
        chatWindow.id = 'groq-chat-window';
        chatWindow.style.cssText = `
            position: fixed;
            bottom: 90px;
            right: 20px;
            width: 350px;
            height: 500px;
            background: white;
            border-radius: 15px;
            box-shadow: 0 5px 40px rgba(0, 0, 0, 0.3);
            display: flex;
            flex-direction: column;
            z-index: 1000;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        `;

        chatWindow.innerHTML = `
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px; border-radius: 15px 15px 0 0; display: flex; justify-content: space-between; align-items: center;">
                <h3 style="margin: 0; font-size: 1.1em;">🚀 ESPduino Assistant</h3>
                <button onclick="document.getElementById('groq-chat-window').remove()" style="background: none; border: none; color: white; font-size: 1.2em; cursor: pointer;">✕</button>
            </div>
            <div id="groq-messages" style="flex: 1; overflow-y: auto; padding: 15px; background: #f9f9f9;"></div>
            <div style="padding: 15px; border-top: 1px solid #e0e0e0; display: flex; gap: 10px;">
                <input type="text" id="groq-input" placeholder="Posez une question..." style="flex: 1; padding: 10px; border: 1px solid #ddd; border-radius: 8px; font-size: 0.95em;">
                <button id="groq-send" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; padding: 10px 15px; border-radius: 8px; cursor: pointer; font-weight: 600;">Envoyer</button>
            </div>
        `;

        document.body.appendChild(chatWindow);

        // Événements
        document.getElementById('groq-send').onclick = sendMessage;
        document.getElementById('groq-input').onkeypress = (e) => {
            if (e.key === 'Enter') sendMessage();
        };
    }

    // Envoyer un message
    async function sendMessage() {
        const input = document.getElementById('groq-input');
        const messagesDiv = document.getElementById('groq-messages');
        const message = input.value.trim();

        if (!message) return;

        // Afficher le message utilisateur
        const userMsg = document.createElement('div');
        userMsg.style.cssText = `
            background: #667eea;
            color: white;
            padding: 10px 15px;
            border-radius: 10px;
            margin-bottom: 10px;
            max-width: 80%;
            margin-left: auto;
            word-wrap: break-word;
        `;
        userMsg.textContent = message;
        messagesDiv.appendChild(userMsg);
        input.value = '';

        // Afficher le loader
        const loader = document.createElement('div');
        loader.id = 'groq-loader';
        loader.style.cssText = `
            padding: 10px 15px;
            color: #999;
            font-size: 0.9em;
        `;
        loader.textContent = '⏳ Assistant pense...';
        messagesDiv.appendChild(loader);
        messagesDiv.scrollTop = messagesDiv.scrollHeight;

        try {
            const response = await fetch(GROQ_API_URL, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${GROQ_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: 'mixtral-8x7b-32768',
                    messages: [
                        {
                            role: 'system',
                            content: 'Tu es un expert en électronique, Arduino, ESP32 et programmation. Tu aides avec des projets IoT, des circuits électroniques et du code C/C++. Sois concis et pratique dans tes réponses.'
                        },
                        {
                            role: 'user',
                            content: message
                        }
                    ],
                    temperature: 0.7,
                    max_tokens: 1000
                })
            });

            loader.remove();

            if (!response.ok) {
                throw new Error(`Erreur ${response.status}`);
            }

            const data = await response.json();
            const assistantMsg = data.choices[0].message.content;

            // Afficher la réponse
            const botMsg = document.createElement('div');
            botMsg.style.cssText = `
                background: #e8e8e8;
                color: #333;
                padding: 10px 15px;
                border-radius: 10px;
                margin-bottom: 10px;
                max-width: 80%;
                word-wrap: break-word;
            `;
            botMsg.textContent = assistantMsg;
            messagesDiv.appendChild(botMsg);
        } catch (error) {
            loader.remove();
            const errorMsg = document.createElement('div');
            errorMsg.style.cssText = `
                background: #ffebee;
                color: #c62828;
                padding: 10px 15px;
                border-radius: 10px;
                margin-bottom: 10px;
            `;
            errorMsg.textContent = '❌ Erreur: ' + error.message;
            messagesDiv.appendChild(errorMsg);
        }

        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }

    // Initialiser au chargement du DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', createChatButton);
    } else {
        createChatButton();
    }
})();

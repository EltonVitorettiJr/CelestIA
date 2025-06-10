let utterance;
const velocidades = [0.8, 1.2, 1.5];

function carregarVozes() {
    return new Promise((resolve) => {
    const vozesDisponiveis = speechSynthesis.getVoices();
    if (vozesDisponiveis.length > 0) {
        resolve(vozesDisponiveis);
    } else {
        speechSynthesis.onvoiceschanged = () => {
        resolve(speechSynthesis.getVoices());
        };
    }
    });
}

async function toggleFala(texto, botao) {
    const estaFalando = botao.classList.contains('falando');

    if (estaFalando) {
    speechSynthesis.cancel();
    botao.classList.remove('falando');
    botao.textContent = "🔊";
    return;
    }

    if (!('speechSynthesis' in window)) {
    alert("Recurso de voz não suportado neste navegador!");
    return;
    }

    try {
    const vozes = await carregarVozes();
    utterance = new SpeechSynthesisUtterance(texto);
    utterance.lang = 'pt-BR';

    const mensagem = botao.closest('.box-response-message');
    const indiceVel = parseInt(mensagem.dataset.velocidadeIndex) || 0;
    utterance.rate = velocidades[indiceVel];
    utterance.pitch = 0.8;

    const vozPreferida = vozes.find(v =>
        v.name.includes("Google português") ||
        v.name.includes("Luciana") ||
        v.lang === 'pt-BR'
    );
    utterance.voice = vozPreferida || null;

    utterance.onstart = () => {
        botao.classList.add('falando');
        botao.textContent = '🔈';
    };

    utterance.onend = utterance.onerror = () => {
        botao.classList.remove('falando');
        botao.textContent = '🔊';
    };

    speechSynthesis.speak(utterance);
    } catch (error) {
    console.error("Erro na síntese de voz:", error);
    alert("Erro ao reproduzir áudio");
    }
}

function proximaVelocidade(botao, mensagemId) {
    const mensagem = document.getElementById(mensagemId);
    let indice = parseInt(mensagem.dataset.velocidadeIndex) || 0;
    indice = (indice + 1) % velocidades.length;

    mensagem.dataset.velocidadeIndex = indice;
    botao.textContent = velocidades[indice] + 'x';

    const botaoAudio = mensagem.querySelector('.icone-audio');
    if (botaoAudio.classList.contains('falando')) {
    speechSynthesis.cancel();
    setTimeout(() => {
        toggleFala(mensagem.querySelector('.texto-mensagem').textContent, botaoAudio);
    }, 100);
    }
}

async function sendMessage() {
    const input = document.getElementById("message-input");
    const message = input.value.trim();
    if (!message) return;

    appendMessage("user", message);
    input.value = "";

    try {
    const response = await fetch("http://localhost:3000/proxy-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userMessage: message }),
    });

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || "Desculpe, não consegui responder.";
    appendMessage("bot", reply);
    } catch (error) {
    console.error("Erro:", error);
    appendMessage("bot", "Ocorreu um erro ao se comunicar com o assistente.");
    }
}

function appendMessage(type, text) {
    const history = document.getElementById("history");
    const messageId = 'msg-' + Date.now();

    const wrapper = document.createElement("div");
    wrapper.className = type === "user" ? "box-my-message" : "box-response-message";
    wrapper.id = messageId;
    wrapper.dataset.velocidadeIndex = "0";

    const bubble = document.createElement("div");
    bubble.className = type === "user" ? "my-message" : "response-message";
    bubble.classList.add("mensagem-container");

    const textoSpan = document.createElement("span");
    textoSpan.className = "texto-mensagem";
    textoSpan.textContent = text;
    bubble.appendChild(textoSpan);

    if (type === "bot") {
    const contentContainer = document.createElement("div");
    contentContainer.className = "message-content-container";

    const botaoAudio = document.createElement("button");
    botaoAudio.className = "icone-audio";
    botaoAudio.textContent = "🔊";
    botaoAudio.onclick = () => toggleFala(text, botaoAudio);

    const textContainer = document.createElement("div");
    textContainer.className = "texto-container";
    textContainer.appendChild(textoSpan);
    textContainer.appendChild(botaoAudio);

    contentContainer.appendChild(textContainer);

    const botaoVelocidade = document.createElement("button");
    botaoVelocidade.className = "botao-velocidade";
    botaoVelocidade.textContent = "0.8x";
    botaoVelocidade.onclick = (e) => {
        e.stopPropagation();
        proximaVelocidade(botaoVelocidade, messageId);
    };

    bubble.appendChild(contentContainer);
    bubble.appendChild(botaoVelocidade);
    }

    wrapper.appendChild(bubble);
    history.appendChild(wrapper);
    history.scrollTop = history.scrollHeight;
}

window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.lang = 'pt-BR';
recognition.interimResults = false;
recognition.maxAlternatives = 1;

const micButton = document.getElementById('btn-microfone');
micButton.addEventListener('click', () => recognition.start());

recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    document.getElementById('message-input').value = transcript;
    sendMessage();
};

recognition.onerror = (event) => {
    console.error("Erro no reconhecimento de voz:", event.error);
    document.getElementById('status').textContent = 'Erro ao reconhecer voz';
};

document.getElementById('message-input').addEventListener('keydown', function (event) {
    if (event.key === 'Enter') {
    event.preventDefault();
    sendMessage();
    }
});

window.speechSynthesis.onvoiceschanged = () => {
    console.log('Vozes carregadas', speechSynthesis.getVoices());
};
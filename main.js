
const messageInput = document.getElementById('message-input');
const status = document.getElementById('status');
const btnSubmit = document.getElementById('btn-submit');
const historyDiv = document.getElementById('history');

function sendMessage() {
    const userMessage = messageInput.value.trim();

    if (!userMessage) {
        messageInput.style.border = '1px solid red';
        return;
    }
    messageInput.style.border = 'none';

    bloquearInterface();
    status.innerHTML = 'Carregando...';
    status.style.display = 'block';

    fetch("http://localhost:3000/proxy-chat", {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userMessage })
    })
    .then(response => response.json())
    .then(data => {
        const resposta = data.choices[0].message.content;
        status.style.display = 'none';
        showHistory(userMessage, resposta);
    })
    .catch(error => {
        console.error(`Erro -> ${error}`);
        status.innerHTML = 'Erro, tente novamente mais tarde...';
    })
    .finally(() => {
        desbloquearInterface();
        messageInput.value = '';
    });
}

function showHistory(userMessage, resposta) {
    const userMsg = document.createElement('div');
    userMsg.classList.add('user-message');
    userMsg.textContent = 'Você: ' + userMessage;

    const assistantMsg = document.createElement('div');
    assistantMsg.classList.add('assistant-message');
    assistantMsg.textContent = 'Assistente: ' + resposta;

    historyDiv.appendChild(userMsg);
    historyDiv.appendChild(assistantMsg);
    historyDiv.scrollTop = historyDiv.scrollHeight;
}

function bloquearInterface() {
    btnSubmit.disabled = true;
    btnSubmit.style.cursor = 'not-allowed';
    messageInput.disabled = true;
}

function desbloquearInterface() {
    btnSubmit.disabled = false;
    btnSubmit.style.cursor = 'pointer';
    messageInput.disabled = false;
}

messageInput.addEventListener('keydown', function (event) {
    if (event.key === 'Enter' && !btnSubmit.disabled) {
        event.preventDefault();
        sendMessage();
    }
});
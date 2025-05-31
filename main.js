function sendMessage() {
    const messageInput = document.getElementById('message-input');
    const status = document.getElementById('status');
    const btnSubmit = document.getElementById('btn-submit');

    if (!messageInput.value) {
        messageInput.style.border = '1px solid red';
        return;
    }
    messageInput.style.border = 'none';

    status.style.display = 'block';
    status.innerHTML = 'Carregando...';
    btnSubmit.disabled = true;
    btnSubmit.style.cursor = 'not-allowed';
    messageInput.disabled = true;

    const userMessage = messageInput.value;

    fetch("http://localhost:3000/proxy-chat", {
        method: 'POST',
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ userMessage })
    })
    .then(response => response.json())
    .then(data => {
        const resposta = data.choices[0].message.content;
        status.style.display = 'none';
        showHistory(userMessage, resposta);
    })
    .catch(error => {
        console.log(`Erro -> ${error}`);
        status.innerHTML = 'Erro, tente novamente mais tarde...';
    })
    .finally(() => {
        btnSubmit.disabled = false;
        btnSubmit.style.cursor = 'pointer';
        messageInput.disabled = false;
        messageInput.value = '';
    });
}

// ✅ ESCUTAR TECLA ENTER PARA ENVIAR
document.getElementById('message-input').addEventListener('keydown', function (event) {
    const btn = document.getElementById('btn-submit');
    if (event.key === 'Enter' && !btn.disabled) {
        event.preventDefault(); // evitar quebra de linha
        sendMessage();
    }
});

function showHistory(userMessage, resposta) {
    const historyDiv = document.getElementById('history');

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

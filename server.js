const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// Troque esta chave pela nova, se você gerar outra depois
const apiKey = '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';

app.post("/proxy-chat", async (req, res) => {
  try {
    const { userMessage } = req.body;

    const response = await axios.post("https://openrouter.ai/api/v1/chat/completions", {
      model: "openai/gpt-3.5-turbo", // modelo mais inteligente
      messages: [
        {
          role: "system",
          content: "Você é um assistente virtual que responde de forma clara, objetiva e precisa. Sempre responda diretamente à dúvida, com explicações fáceis de entender. Evite enrolação ou respostas genéricas."
        },
        {
          role: "user",
          content: userMessage
        }
      ],
      max_tokens: 500,
      temperature: 0.7 // controla criatividade. 0.7 é um bom equilíbrio
    }, {
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      }
    });

    res.json(response.data);
  } catch (error) {
    console.error("Erro no proxy:", error.response?.data || error.message);
    res.status(500).json({ error: "Erro ao buscar resposta do OpenRouter" });
  }
});

app.listen(3000, () => {
  console.log("Servidor proxy rodando em http://localhost:3000");
});

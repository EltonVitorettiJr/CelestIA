const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// 🔑 Chave do OpenRouter (ChatGPT)
const apiKey = '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';

// 🔑 Chave da OpenWeatherMap (Clima)
const weatherApiKey = 'e9a4eb2f2a6b0b54f6b249011c79344d';

// 🔹 Rota de Chat com IA
app.post("/proxy-chat", async (req, res) => {
  try {
    const { userMessage } = req.body;

    const response = await axios.post("https://openrouter.ai/api/v1/chat/completions", {
      model: "openai/gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "Você é um assistente virtual que responde de forma clara, objetiva e natural. Suas respostas devem ser adequadas para conversação e síntese de voz, com frases curtas e estrutura simples. Evite caracteres especiais, markdown ou formatação complexa."
        },
        {
          role: "user",
          content: userMessage
        }
      ],
      max_tokens: 500,
      temperature: 0.7
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

// 🔹 Rota de Clima
app.get("/clima", async (req, res) => {
  const cidade = req.query.cidade || "São Paulo";

  try {
    const resposta = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?q=${cidade}&appid=${weatherApiKey}&units=metric&lang=pt_br`
    );

    const dados = resposta.data;

    res.json({
      cidade: dados.name,
      descricao: dados.weather[0].description,
      temperatura: dados.main.temp,
      sensacao: dados.main.feels_like,
      umidade: dados.main.humidity,
      vento: dados.wind.speed
    });
  } catch (error) {
    console.error("Erro ao buscar clima:", error.response?.data || error.message);
    res.status(500).json({ erro: "Erro ao buscar dados do clima" });
  }
});

// 🔊 Iniciar servidor
app.listen(3000, () => {
  console.log("Servidor proxy rodando em http://localhost:3000");
});


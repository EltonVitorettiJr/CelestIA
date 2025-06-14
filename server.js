const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const apiKey = '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';
const weatherApiKey = 'f5e60115af65f09b1ca941a7396fe0b9';

app.post("/proxy-chat", async (req, res) => {
    const { messages } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({ error: "Envie um array 'messages' não vazio" });
    }

    try {

        const response = await axios.post(
            "https://openrouter.ai/api/v1/chat/completions",
            {
                model: "openai/gpt-3.5-turbo",
                messages: messages,
                max_tokens: 500,
                temperature: 0.7
            },
            {
                headers: {
                    "Authorization": `Bearer ${apiKey}`,
                    "Content-Type": "application/json"
                }
            }
        );

        res.json(response.data);
    } catch (error) {
        console.error("Erro no proxy:", error.response?.data || error.message);
        res.status(500).json({ error: "Erro ao buscar resposta do OpenRouter" });
    }
});

app.get("/clima", async (req, res) => {
  const cidade = req.query.cidade || "São Paulo";

  // Headers para evitar cache
  res.set({
    "Cache-Control": "no-cache, no-store, must-revalidate",
    "Pragma": "no-cache",
    "Expires": "0"
  });

  try {
    const resposta = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(cidade)}&appid=${weatherApiKey}&units=metric&lang=pt_br`
    );

    const d = resposta.data;
    res.json({
      cidade: d.name,
      descricao: d.weather[0].description,
      temperatura: d.main.temp,
      sensacao: d.main.feels_like,
      umidade: d.main.humidity,
      vento: d.wind.speed
    });

  } catch (error) {
    console.error("Erro ao buscar clima:", error.response?.data || error.message);
    res.status(500).json({ erro: "Erro ao buscar dados do clima" });
  }
});

app.listen(3000, () => {
    console.log("Servidor proxy rodando em http://localhost:3000");
});
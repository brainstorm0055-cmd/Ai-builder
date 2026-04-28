import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect(process.env.MONGO_URL);

// MODELO
const Projeto = mongoose.model("Projeto", {
  prompt: String,
  html: String
});

// ROTA IA
app.post("/gerar", async (req, res) => {

  const resposta = await axios.post(
    "https://api.openai.com/v1/chat/completions",
    {
      model: "gpt-4.1",
      messages: [
        {
          role: "system",
          content: "Crie um site moderno em HTML completo"
        },
        {
          role: "user",
          content: req.body.prompt
        }
      ]
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
      }
    }
  );

  const html = resposta.data.choices[0].message.content;

  await Projeto.create({
    prompt: req.body.prompt,
    html
  });

  res.json({ html });
});

app.listen(3000, () => console.log("Rodando..."));

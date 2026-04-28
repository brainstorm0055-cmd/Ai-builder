import express from "express";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import cors from "cors";
import axios from "axios";
import dotenv from "dotenv";

import { analisarPrompt } from "./ai/analisador.js";
import { criarPlano } from "./ai/planejador.js";
import { buscarContexto } from "./ai/memoria.js";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect(process.env.MONGO_URL);

// MODELOS
const User = mongoose.model("User", {
  email: String,
  password: String
});

// AUTH
function auth(req, res, next) {
  try {
    req.user = jwt.verify(req.headers.authorization, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ erro: "Não autorizado" });
  }
}

// REGISTER
app.post("/register", async (req, res) => {
  const hash = await bcrypt.hash(req.body.password, 10);
  const user = await User.create({
    email: req.body.email,
    password: hash
  });
  res.json(user);
});

// LOGIN
app.post("/login", async (req, res) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) return res.json({ erro: "Usuário não encontrado" });

  const ok = await bcrypt.compare(req.body.password, user.password);
  if (!ok) return res.json({ erro: "Senha inválida" });

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
  res.json({ token });
});

// IA INTELIGENTE
app.post("/gerar", auth, async (req, res) => {

  const prompt = req.body.prompt;

  const analise = analisarPrompt(prompt);
  const plano = criarPlano(analise);
  const contexto = buscarContexto();

  const resposta = await axios.post(
    "https://api.openai.com/v1/chat/completions",
    {
      model: "gpt-4.1",
      messages: [
        {
          role: "system",
          content: `
Você é uma IA profissional.

PLANO:
${plano}

REFERÊNCIA:
${contexto}

Crie um site completo, moderno e bonito.

Retorne apenas HTML completo.
`
        },
        { role: "user", content: prompt }
      ]
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
      }
    }
  );

  const html = resposta.data.choices[0].message.content;

  res.json({ html });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Servidor rodando"));

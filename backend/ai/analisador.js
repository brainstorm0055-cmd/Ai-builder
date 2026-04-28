export function analisarPrompt(prompt) {
  prompt = prompt.toLowerCase();

  return {
    tipo:
      prompt.includes("filme") ? "filmes" :
      prompt.includes("loja") ? "ecommerce" :
      prompt.includes("login") ? "sistema" :
      "moderno",

    complexidade:
      prompt.length > 100 ? "alta" : "media",

    features: [
      prompt.includes("login") && "auth",
      prompt.includes("admin") && "dashboard",
      prompt.includes("api") && "backend"
    ].filter(Boolean)
  };
}

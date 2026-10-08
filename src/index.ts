import dotenv from "dotenv";

dotenv.config();

function main() {
  console.log("🚀 [github-profile-catalog-bot] Inicializado com sucesso!");
  console.log(`👤 Usuário configurado: ${process.env.GITHUB_USERNAME || "Não informado"}`);
}

main();

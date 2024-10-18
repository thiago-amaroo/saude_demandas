import "dotenv/config";
import app from "./src/app.js";

app.listen( process.env.porta, () => {
  console.log(`Servidor ouvindo na porta ${process.env.porta}`);
});
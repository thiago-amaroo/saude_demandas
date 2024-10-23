import "dotenv/config";
import express from "express";
import db from "./config/dbConnect.js";
import routes from "./routes/index.js";
import url from "url";
import path from "path";


db.on("error", console.log.bind(console, "Erro de conexão"));
db.once("open", () => {
  console.log("Conexao com BD feita com sucesso");
});

const app = express();

app.set("view engine", "ejs");
app.set("views", "./views");

app.use(express.json());

const caminhoAtual = url.fileURLToPath(import.meta.url);
const diretorioPublico = path.join(caminhoAtual, "../..", "views");
console.log(diretorioPublico);
app.use(express.static(diretorioPublico));



routes(app);




  
export default app;
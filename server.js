import "dotenv/config";
import app from "./src/app.js";
import https from "https";
import fs from "fs";


const key = fs.readFileSync("./ssl/localhost+2-key.pem");
const cert = fs.readFileSync("./ssl/localhost+2.pem");

const server = https.createServer({key: key, cert: cert }, app);

server.listen(process.env.porta, () => { 
  console.log(`Servidor ouvindo na porta ${process.env.porta}`); });

// app.listen( process.env.porta, () => {
//   console.log(`Servidor ouvindo na porta ${process.env.porta}`);
// });
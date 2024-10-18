import express from "express";
import user from "./userRoutes.js";
import demanda from "./demandaRoute.js";
import cookieParser from "cookie-parser";

const routes = (app) => {
  app.get("/", (req, res) => {
    res.status(200).redirect("/login");
  });

  app.use (
    //express.urlencoded(), //converte body da requisicao em application form
    express.json(),
    cookieParser(), //consigo colocar dados do cookie no objeto req
    user,
    demanda
  );
};

export default routes;
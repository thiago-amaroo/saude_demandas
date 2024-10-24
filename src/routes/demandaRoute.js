import express from "express";
import estaLogado from "../middlewares/estaLogado.js";
import upload from "../utils/uploadArquivo.js";
import DemandaConsultaController from "../controllers/DemandaConsultaController.js";
import DemandaExameController from "../controllers/DemandaExameController.js";
import DemandaAgendadosController from "../controllers/DemandaAgendamentosController.js";

const router = express.Router();

const demandaConsultaController = new DemandaConsultaController();
const demandaExameController = new DemandaExameController();

router
  .get("/demandas/consultas", estaLogado, (req, res) => demandaConsultaController.listaDemandas(req, res))
  .post("/admin/demandas/consultas", estaLogado, upload.single("file"), (req, res) => demandaConsultaController.atualizaDemandas(req, res))

  .get("/demandas/exames", estaLogado, (req, res) => demandaExameController.listaDemandas(req, res))
  .post("/admin/demandas/exames", estaLogado, upload.single("file"), (req, res) => demandaExameController.atualizaDemandas(req, res))

  .post("/admin/demandas/agendamentos", estaLogado, upload.single("file"), DemandaAgendadosController.atualizaAgendamentos )

  .get("/demandas/consultas/:idRecurso/:ano", estaLogado, (req, res) => demandaConsultaController.mostraDetalhesDemanda(req, res));

  
export default router;

DemandaExameController;
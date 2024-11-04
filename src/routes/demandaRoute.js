import express from "express";
import estaLogado from "../middlewares/estaLogado.js";
import upload from "../utils/uploadArquivo.js";
import DemandaConsultaController from "../controllers/DemandaConsultaController.js";
import DemandaExameController from "../controllers/DemandaExameController.js";
import DemandaAgendadosController from "../controllers/DemandaAgendamentosController.js";
import RecursoInternoController from "../controllers/RecursoInternoController.js";

const router = express.Router();

const demandaConsultaController = new DemandaConsultaController();
const demandaExameController = new DemandaExameController();

router
  .get("/demandas/consultas", estaLogado, (req, res, next) => demandaConsultaController.listaDemandas(req, res, next))
  .post("/admin/demandas/consultas", estaLogado, upload.single("file"), (req, res, next) => demandaConsultaController.atualizaDemandas(req, res, next))

  .get("/demandas/exames", estaLogado, (req, res, next) => demandaExameController.listaDemandas(req, res, next))
  .post("/admin/demandas/exames", estaLogado, upload.single("file"), (req, res, next) => demandaExameController.atualizaDemandas(req, res, next))

  .post("/admin/demandas/agendamentos", estaLogado, upload.single("file"), DemandaAgendadosController.atualizaAgendamentos )

  .get("/demandas/consultas/:idRecurso/:ano", estaLogado, (req, res, next) => demandaConsultaController.mostraDetalhesDemanda(req, res, next))
  .get("/demandas/consultas/:ano", estaLogado, (req, res, next) => demandaConsultaController.mostraGraficoTotalDemandasAno(req, res, next))

  .get("/demandas/exames/:idRecurso/:ano", estaLogado, (req, res, next) => demandaExameController.mostraDetalhesDemanda(req, res, next))
  .get("/demandas/exames/:ano", estaLogado, (req, res, next) => demandaExameController.mostraGraficoTotalDemandasAno(req, res, next))

  .get("/demandas/recursos_internos/:idRecurso/:ano", estaLogado, RecursoInternoController.mostraDetalhesRecursoInterno)
  .get("/demandas/recursos_internos/:ano", estaLogado,  RecursoInternoController.mostraGraficoTotalRecursosInternosAno)

  .get("/demandas/recursos_internos", estaLogado, RecursoInternoController.listaRecursosInternos )
  .post("/admin/demandas/recursos_internos", estaLogado, upload.single("file"), RecursoInternoController.atualizaRecursosInternos );

  
export default router;

DemandaExameController;
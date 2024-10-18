import demandasConsultas from "../models/Demanda-consulta.js";
import DemandaGenericController from "./DemandaGenericController.js";

class DemandaConsultaController extends DemandaGenericController {
  constructor() {
    super(demandasConsultas, "demandas_consultas");
  }
}

export default DemandaConsultaController;
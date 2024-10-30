import demandasExames from "../models/Demanda-exame.js";
import DemandaGenericController from "./DemandaGenericController.js";


class DemandaExameController extends DemandaGenericController {
  constructor() {
    super(demandasExames, "demandas_exames");
  }


}

export default DemandaExameController;
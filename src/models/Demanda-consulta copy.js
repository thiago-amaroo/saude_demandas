import mongoose from "mongoose";

const demandaConsultaSchema = new mongoose.Schema(
  {
    id: { type: String },
    especialidade : { type: String, required: [true, "Nome da especialidade obrigatorio"] },
    ano: { type: Array }
  },
  {
    versionKey: false
  }
);

const demandasConsultas = mongoose.model("demandas_consultas", demandaConsultaSchema);

export default demandasConsultas;
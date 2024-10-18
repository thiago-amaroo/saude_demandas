import mongoose from "mongoose";

const demandaConsultaSchema = new mongoose.Schema(
  {
    id: { type: String },
    especialidade : { type: String, required: [true, "Nome da especialidade obrigatorio"] },
    qtde_pacientes: { type: Number, required: [true, "Quantidade de pacientes obrigatoria"] },
  },
  {
    versionKey: false
  }
);

const demandasConsultas = mongoose.model("demandas_consultas", demandaConsultaSchema);

export default demandasConsultas;
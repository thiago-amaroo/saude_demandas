import mongoose from "mongoose";

const demandaConsultaSchema = new mongoose.Schema(
  {
    id: { type: String },
    especialidade : { type: String, required: [true, "Nome da especialidade obrigatorio"] },
    pacientes: [
      {
        _id: false,
        ano: { type: String },
        janeiro: { type: Number, default: 0 },
        fevereiro: { type: Number, default: 0 },
        marco: { type: Number, default: 0 },
        abril: { type: Number, default: 0 },
        maio: { type: Number, default: 0 },
        junho: { type: Number, default: 0 },
        julho: { type: Number, default: 0 },
        agosto: { type: Number, default: 0 },
        setembro: { type: Number, default: 0 },
        outubro: { type: Number, default: 0 },
        novembro: { type: Number, default: 0 },
        dezembro: { type: Number, default: 0 },
      }
    ]
  },
  {
    versionKey: false
  }
);

const demandasConsultas = mongoose.model("demandas_consultas", demandaConsultaSchema);

export default demandasConsultas;
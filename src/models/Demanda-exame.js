import mongoose from "mongoose";

const demandaExameSchema = new mongoose.Schema(
  {
    id: { type: String },
    exame : { type: String, required: [true, "Nome do exame obrigatorio"] },
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
  },
  {
    versionKey: false
  }
);

const demandasExames = mongoose.model("demandas_exames", demandaExameSchema);

export default demandasExames;
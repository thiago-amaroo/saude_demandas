import mongoose from "mongoose";

const recursoInternoSchema = new mongoose.Schema(
  {
    id: { type: String },
    recurso : { type: String, required: [true, "Nome do recurso obrigatorio"] },
    pacientes: [
      {
        _id: false,
        ano: { type: String },
        janeiro: {
          demanda: { type: Number, default: 0 },
          atendidos: { type: Number, default: 0 },
        },
        fevereiro: {
          demanda: { type: Number, default: 0 },
          atendidos: { type: Number, default: 0 },
        },
        marco: {
          demanda: { type: Number, default: 0 },
          atendidos: { type: Number, default: 0 },
        },
        abril: {
          demanda: { type: Number, default: 0 },
          atendidos: { type: Number, default: 0 },
        },
        maio: {
          demanda: { type: Number, default: 0 },
          atendidos: { type: Number, default: 0 },
        },
        junho: {
          demanda: { type: Number, default: 0 },
          atendidos: { type: Number, default: 0 },
        },
        julho: {
          demanda: { type: Number, default: 0 },
          atendidos: { type: Number, default: 0 },
        },
        agosto: {
          demanda: { type: Number, default: 0 },
          atendidos: { type: Number, default: 0 },
        },
        setembro: {
          demanda: { type: Number, default: 0 },
          atendidos: { type: Number, default: 0 },
        },
        outubro: {
          demanda: { type: Number, default: 0 },
          atendidos: { type: Number, default: 0 },
        },
        novembro: {
          demanda: { type: Number, default: 0 },
          atendidos: { type: Number, default: 0 },
        },
        dezembro: {
          demanda: { type: Number, default: 0 },
          atendidos: { type: Number, default: 0 },
        }
      }
    ]
  },
  {
    versionKey: false
  }
);

const recursoInterno = mongoose.model("recursos_internos", recursoInternoSchema);

export default recursoInterno;
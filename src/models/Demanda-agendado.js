import mongoose from "mongoose";

const demandaAgendadoSchema = new mongoose.Schema(
  {
    id: { type: String },
    recurso : { type: String, required: [true, "Nome do recurso obrigatorio"] },
    oferta: { type: Number, defatul: 0 },
    agendado: { type: Number, defatul: 0 },

  },
  {
    versionKey: false
  }
);

const demandasAgendados = mongoose.model("agendados", demandaAgendadoSchema);

export default demandasAgendados;
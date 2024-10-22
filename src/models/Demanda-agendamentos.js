import mongoose from "mongoose";

const demandaAgendamentoSchema = new mongoose.Schema(
  {
    id: { type: String },
    recurso : { type: String, required: [true, "Nome do recurso obrigatorio"] },
    data: { type: String, defatul: 0 },

  },
  {
    versionKey: false
  }
);

const demandasAgendados = mongoose.model("agendamentos", demandaAgendamentoSchema);

export default demandasAgendados;
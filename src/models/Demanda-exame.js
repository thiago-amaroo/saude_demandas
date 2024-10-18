import mongoose from "mongoose";

const demandaExameSchema = new mongoose.Schema(
  {
    id: { type: String },
    exame : { type: String, required: [true, "Nome do exame obrigatorio"] },
    qtde_pacientes: { type: Number, required: [true, "Quantidade de pacientes obrigatoria"] },
  },
  {
    versionKey: false
  }
);

const demandasExames = mongoose.model("demandas_exames", demandaExameSchema);

export default demandasExames;
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    id: { type: String },
    usuario : { type: String, required: [true, "Nome de usuario obrigatorio"] },
    hashSenha: { type: String, required: [true, "Hash Senha obrigatoria"] },
    salSenha: { type: String, required: [true, "salSenha obrigatoria"] },
    role: { type: String, required: [true, "Role obrigatorio"] },
  },
  {
    versionKey: false
  }
);

const users = mongoose.model("users", userSchema);

export default users;
import mongoose from "mongoose";

const ClientSchema = new mongoose.Schema(
  {
    nome: { type: String, required: true },
    email: { type: String, required: true },
    telefone: { type: String, required: true },
  },
  { timestamps: true }
);

export const clientModel = mongoose.model("Client", ClientSchema);

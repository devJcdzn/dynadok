import { Schema, Model } from "mongoose";

const ClientSchema = new Schema(
  {
    nome: { type: String, required: true },
    email: { type: String, required: true },
    telefone: { type: String, required: true },
  },
  { timestamps: true }
);

export const clientModel = new Model("Client", ClientSchema);

import mongoose, { Schema, Document } from "mongoose";

export interface IToken extends Document {
  userId: mongoose.Types.ObjectId;
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
}

const TokenSchema = new Schema<IToken>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    accessToken: {
      type: String,
      required: true,
    },
    refreshToken: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model<IToken>("Token", TokenSchema);

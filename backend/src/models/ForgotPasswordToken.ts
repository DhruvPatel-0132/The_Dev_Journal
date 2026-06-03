import mongoose, { Schema, Document } from "mongoose";

export interface IForgotPasswordToken extends Document {
  userId: mongoose.Types.ObjectId;
  token: string;
  expiresAt: Date;
}

const ForgotPasswordTokenSchema = new Schema<IForgotPasswordToken>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    token: {
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

// Auto-delete expired tokens from MongoDB
ForgotPasswordTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// One active reset token per user at a time
ForgotPasswordTokenSchema.index({ userId: 1 }, { unique: true });

export default mongoose.model<IForgotPasswordToken>("ForgotPasswordToken", ForgotPasswordTokenSchema);

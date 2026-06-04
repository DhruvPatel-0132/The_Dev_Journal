import mongoose, { Schema, Document } from "mongoose";

export interface IEmailVerificationOTP extends Document {
  userId: mongoose.Types.ObjectId;
  email: string;
  otp: string;
  expiresAt: Date;
}

const EmailVerificationOTPSchema = new Schema<IEmailVerificationOTP>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
    },
    otp: {
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

// Auto-delete expired documents
EmailVerificationOTPSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model<IEmailVerificationOTP>(
  "EmailVerificationOTP",
  EmailVerificationOTPSchema
);

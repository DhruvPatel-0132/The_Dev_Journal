import dotenv from "dotenv";

dotenv.config();

type Env = {
  PORT: number;
  MONGO_URI: string;
  JWT_SECRET: string;
  REFRESH_TOKEN_SECRET: string;
};

function required(key: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`Missing env: ${key}`);
  }

  return value;
}

export const env: Env = {
  PORT: Number(process.env.PORT) || 5000,
  MONGO_URI: required("MONGO_URI", process.env.MONGO_URI),
  JWT_SECRET: required("JWT_SECRET", process.env.JWT_SECRET),
  REFRESH_TOKEN_SECRET: required("REFRESH_TOKEN_SECRET", process.env.REFRESH_TOKEN_SECRET),
};
// src/utils/hash.ts
import bcrypt from "bcrypt";
import crypto from "crypto";

export const hashPassword = (password: string) =>
  bcrypt.hash(password, 10);

export const comparePassword = (password: string, hash: string) =>
  bcrypt.compare(password, hash);

// SHA-256 hash for tokens (deterministic — safe for DB lookup)
export const hashToken = (token: string): string =>
  crypto.createHash("sha256").update(token).digest("hex");

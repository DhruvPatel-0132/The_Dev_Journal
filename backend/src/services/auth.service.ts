// src/services/auth.service.ts
import { User } from "../models/User.model";
import { hashPassword, comparePassword } from "../utils/hash";
import { generateToken } from "./jwt.service";

export const registerUser = async (data: any) => {
  const exists = await User.findOne({ email: data.email });
  if (exists) throw new Error("User already exists");

  const user = await User.create({
    name: data.name,
    email: data.email,
    password: await hashPassword(data.password),
    role: data.role || "VISITOR",
  });

  return user;
};

export const loginUser = async (email: string, password: string) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error("User not found");

  const valid = await comparePassword(password, user.password);
  if (!valid) throw new Error("Invalid credentials");

  const token = generateToken({
    id: user._id,
    role: user.role,
  });

  return { user, token };
};
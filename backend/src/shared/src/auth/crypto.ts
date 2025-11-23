import crypto from "crypto";
import bcrypt from "bcryptjs";

export function generateRandomToken(size = 64): string {
  return crypto.randomBytes(size).toString("base64url");
}

export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export async function hashPassword(password: string) {
  return await bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hashPassword: string) {
  return await bcrypt.compare(password, hashPassword);
}

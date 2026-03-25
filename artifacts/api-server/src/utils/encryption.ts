import crypto from "crypto";

const ALGORITHM = "aes-256-cbc";

function getKey(): Buffer {
  const keyHex = process.env.MAJLIS_ENCRYPTION_KEY;
  if (!keyHex) {
    throw new Error("MAJLIS_ENCRYPTION_KEY environment variable is required");
  }
  return Buffer.from(keyHex, "hex");
}

export function encrypt(plaintext: string): string {
  const key = getKey();
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(plaintext, "utf8", "hex");
  encrypted += cipher.final("hex");
  return iv.toString("hex") + ":" + encrypted;
}

export function decrypt(stored: string): string {
  const key = getKey();
  const parts = stored.split(":");
  if (parts.length !== 2) {
    return stored;
  }
  try {
    const iv = Buffer.from(parts[0], "hex");
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    let decrypted = decipher.update(parts[1], "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  } catch {
    return stored;
  }
}

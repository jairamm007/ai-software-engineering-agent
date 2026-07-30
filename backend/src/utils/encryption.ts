import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;
const TAG_LENGTH = 16;
const SEPARATOR = ":";

function getKey(): Buffer {
  const key = process.env.GITHUB_TOKEN_ENCRYPTION_KEY;
  if (!key) {
    throw new Error(
      "GITHUB_TOKEN_ENCRYPTION_KEY is required for token encryption. " +
      "Generate one with: node -e \"console.log(crypto.randomBytes(32).toString('hex'))\""
    );
  }
  const buf = Buffer.from(key, "hex");
  if (buf.length !== 32) {
    throw new Error("GITHUB_TOKEN_ENCRYPTION_KEY must be a 64-character hex string (32 bytes)");
  }
  return buf;
}

export const encryptToken = (plaintext: string): string => {
  const key = getKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);

  const tag = cipher.getAuthTag();

  return `${iv.toString("hex")}${SEPARATOR}${tag.toString("hex")}${SEPARATOR}${encrypted.toString("hex")}`;
};

export const decryptToken = (encrypted: string): string => {
  const key = getKey();
  const parts = encrypted.split(SEPARATOR);

  if (parts.length !== 3) {
    return encrypted;
  }

  try {
    const iv = Buffer.from(parts[0], "hex");
    const tag = Buffer.from(parts[1], "hex");
    const data = Buffer.from(parts[2], "hex");

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);

    const decrypted = Buffer.concat([
      decipher.update(data),
      decipher.final(),
    ]);

    return decrypted.toString("utf8");
  } catch {
    return encrypted;
  }
};

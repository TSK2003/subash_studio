import jwt from "jsonwebtoken";
import ENV from "../config/env.js";

const DEFAULT_EXPIRATION = "7d";

export function generateToken(payload, expiresIn = DEFAULT_EXPIRATION) {
  return jwt.sign(payload, ENV.JWT_SECRET, { expiresIn });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, ENV.JWT_SECRET);
  } catch (err) {
    return null;
  }
}

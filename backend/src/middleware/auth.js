import { verifyToken } from "../utils/token.js";
import prisma from "../config/prisma.js";

export async function authenticateAdmin(req, res, next) {
  try {
    let token = null;

    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies && req.cookies.admin_token) {
      token = req.cookies.admin_token;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        error: "Authentication required. Please log in to access this resource.",
      });
    }

    const decoded = verifyToken(token);
    if (!decoded || !decoded.userId) {
      return res.status(401).json({
        success: false,
        error: "Session expired or invalid token. Please log in again.",
      });
    }

    // Lookup admin in database
    const admin = await prisma.adminUser.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
      },
    });

    if (!admin) {
      return res.status(401).json({
        success: false,
        error: "Admin account not found.",
      });
    }

    req.user = admin;
    next();
  } catch (err) {
    console.error("Auth middleware error:", err);
    return res.status(500).json({
      success: false,
      error: "An internal authentication error occurred.",
    });
  }
}

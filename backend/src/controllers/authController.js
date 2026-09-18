import * as authService from "../services/authService.js";
import ENV from "../config/env.js";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: ENV.NODE_ENV === "production",
  sameSite: "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const { user, token } = await authService.loginAdmin({ email, password });

    res.cookie("admin_token", token, COOKIE_OPTIONS);

    res.json({
      success: true,
      user,
      token,
    });
  } catch (err) {
    res.status(401).json({
      success: false,
      error: err.message || "Invalid credentials.",
    });
  }
}

export async function logout(req, res) {
  res.clearCookie("admin_token", COOKIE_OPTIONS);
  res.json({
    success: true,
    message: "Logged out successfully.",
  });
}

export async function getMe(req, res) {
  res.json({
    success: true,
    user: req.user,
  });
}

export async function updateProfile(req, res, next) {
  try {
    const updated = await authService.updateAdminProfile(req.user.id, req.body);
    res.json({
      success: true,
      user: updated,
    });
  } catch (err) {
    next(err);
  }
}

export async function changePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body;
    await authService.changeAdminPassword(req.user.id, { currentPassword, newPassword });
    res.json({
      success: true,
      message: "Password changed successfully.",
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message,
    });
  }
}

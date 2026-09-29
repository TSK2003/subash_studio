import * as settingsService from "../services/settingsService.js";
import { notifyDataChanged } from "../services/realtimeService.js";

export async function getAllSettings(req, res, next) {
  try {
    const settings = await settingsService.getAllSettings();
    res.json(settings);
  } catch (err) {
    next(err);
  }
}

export async function getSettingsBySection(req, res, next) {
  try {
    const settings = await settingsService.getSettingsBySection(req.params.section);
    if (!settings) return res.status(404).json({ error: "Settings section not found" });
    res.json(settings);
  } catch (err) {
    next(err);
  }
}

export async function updateSettings(req, res, next) {
  try {
    const updated = await settingsService.updateSettings(req.params.section, req.body);
    notifyDataChanged({ entity: "content", action: "updated", id: req.params.section });
    res.json(updated.data);
  } catch (err) {
    next(err);
  }
}

export async function exportDataSnapshot(req, res, next) {
  try {
    const adminEmail = req.admin?.email || "admin";
    const snapshot = await settingsService.exportFullDataSnapshot(adminEmail);
    res.json(snapshot);
  } catch (err) {
    next(err);
  }
}


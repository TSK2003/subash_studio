import * as settingsService from "../services/settingsService.js";

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
    res.json(updated.data);
  } catch (err) {
    next(err);
  }
}

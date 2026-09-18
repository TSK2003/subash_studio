import * as contentService from "../services/contentService.js";

export async function getAllContent(req, res, next) {
  try {
    const content = await contentService.getAllContent();
    res.json(content);
  } catch (err) {
    next(err);
  }
}

export async function getContentBySection(req, res, next) {
  try {
    const content = await contentService.getContentBySection(req.params.section);
    if (!content) return res.status(404).json({ error: "Section content not found" });
    res.json(content);
  } catch (err) {
    next(err);
  }
}

export async function updateContent(req, res, next) {
  try {
    const updated = await contentService.updateContent(req.params.section, req.body);
    res.json(updated.data);
  } catch (err) {
    next(err);
  }
}

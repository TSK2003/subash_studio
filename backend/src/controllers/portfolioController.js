import * as portfolioService from "../services/portfolioService.js";

export async function getAllPortfolio(req, res, next) {
  try {
    const includeUnpublished = req.query.all === "true" || Boolean(req.user);
    const portfolio = await portfolioService.getAllPortfolio(includeUnpublished);
    res.json(portfolio);
  } catch (err) {
    next(err);
  }
}

export async function getPortfolioById(req, res, next) {
  try {
    const project = await portfolioService.getPortfolioById(req.params.id);
    if (!project) return res.status(404).json({ error: "Portfolio project not found" });
    res.json(project);
  } catch (err) {
    next(err);
  }
}

export async function createPortfolioProject(req, res, next) {
  try {
    const project = await portfolioService.createPortfolioProject(req.body);
    res.status(201).json(project);
  } catch (err) {
    next(err);
  }
}

export async function updatePortfolioProject(req, res, next) {
  try {
    const project = await portfolioService.updatePortfolioProject(req.params.id, req.body);
    res.json(project);
  } catch (err) {
    next(err);
  }
}

export async function deletePortfolioProject(req, res, next) {
  try {
    await portfolioService.deletePortfolioProject(req.params.id);
    res.json({ success: true, message: "Portfolio project deleted successfully." });
  } catch (err) {
    next(err);
  }
}

export async function toggleFeatured(req, res, next) {
  try {
    const project = await portfolioService.togglePortfolioFeatured(req.params.id);
    res.json(project);
  } catch (err) {
    next(err);
  }
}

export async function togglePublished(req, res, next) {
  try {
    const project = await portfolioService.togglePortfolioPublished(req.params.id);
    res.json(project);
  } catch (err) {
    next(err);
  }
}

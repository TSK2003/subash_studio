import * as branchesService from "../services/branchesService.js";

export async function getAllBranches(req, res, next) {
  try {
    const includeInactive = req.query.all === "true" || Boolean(req.user);
    const branches = await branchesService.getAllBranches(includeInactive);
    res.json(branches);
  } catch (err) {
    next(err);
  }
}

export async function createBranch(req, res, next) {
  try {
    const branch = await branchesService.createBranch(req.body);
    res.status(201).json(branch);
  } catch (err) {
    next(err);
  }
}

export async function updateBranch(req, res, next) {
  try {
    const branch = await branchesService.updateBranch(req.params.id, req.body);
    res.json(branch);
  } catch (err) {
    next(err);
  }
}

export async function deleteBranch(req, res, next) {
  try {
    await branchesService.deleteBranch(req.params.id);
    res.json({ success: true, message: "Branch deleted successfully." });
  } catch (err) {
    next(err);
  }
}

export async function toggleStatus(req, res, next) {
  try {
    const branch = await branchesService.toggleBranchStatus(req.params.id);
    res.json(branch);
  } catch (err) {
    next(err);
  }
}

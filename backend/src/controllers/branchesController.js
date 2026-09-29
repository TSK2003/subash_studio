import * as branchesService from "../services/branchesService.js";
import { notifyDataChanged } from "../services/realtimeService.js";

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
    notifyDataChanged({ entity: "branches", action: "created", id: branch.id });
    res.status(201).json(branch);
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({ success: false, error: err.message });
    }
    next(err);
  }
}

export async function updateBranch(req, res, next) {
  try {
    const branch = await branchesService.updateBranch(req.params.id, req.body);
    notifyDataChanged({ entity: "branches", action: "updated", id: branch.id });
    res.json(branch);
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({ success: false, error: err.message });
    }
    next(err);
  }
}

export async function deleteBranch(req, res, next) {
  try {
    await branchesService.deleteBranch(req.params.id);
    notifyDataChanged({ entity: "branches", action: "deleted", id: req.params.id });
    res.json({ success: true, message: "Branch deleted successfully." });
  } catch (err) {
    next(err);
  }
}

export async function toggleStatus(req, res, next) {
  try {
    const branch = await branchesService.toggleBranchStatus(req.params.id);
    notifyDataChanged({ entity: "branches", action: "status_changed", id: branch.id });
    res.json(branch);
  } catch (err) {
    next(err);
  }
}

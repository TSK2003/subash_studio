import * as servicesService from "../services/servicesService.js";

export async function getAllServices(req, res, next) {
  try {
    const services = await servicesService.getAllServices();
    res.json(services);
  } catch (err) {
    next(err);
  }
}

export async function getServiceById(req, res, next) {
  try {
    const service = await servicesService.getServiceById(req.params.id);
    if (!service) return res.status(404).json({ error: "Service not found" });
    res.json(service);
  } catch (err) {
    next(err);
  }
}

export async function createService(req, res, next) {
  try {
    const service = await servicesService.createService(req.body);
    res.status(201).json(service);
  } catch (err) {
    next(err);
  }
}

export async function updateService(req, res, next) {
  try {
    const service = await servicesService.updateService(req.params.id, req.body);
    res.json(service);
  } catch (err) {
    next(err);
  }
}

export async function deleteService(req, res, next) {
  try {
    await servicesService.deleteService(req.params.id);
    res.json({ success: true, message: "Service deleted successfully." });
  } catch (err) {
    next(err);
  }
}

export async function toggleStatus(req, res, next) {
  try {
    const service = await servicesService.toggleServiceStatus(req.params.id);
    res.json(service);
  } catch (err) {
    next(err);
  }
}

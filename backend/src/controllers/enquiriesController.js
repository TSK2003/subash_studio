import * as enquiriesService from "../services/enquiriesService.js";
import { notifyDataChanged } from "../services/realtimeService.js";

export async function getAllEnquiries(req, res, next) {
  try {
    const enquiries = await enquiriesService.getAllEnquiries(req.query);
    res.json(enquiries);
  } catch (err) {
    next(err);
  }
}

export async function createEnquiry(req, res, next) {
  try {
    const enquiry = await enquiriesService.createEnquiry(req.body);
    notifyDataChanged({ entity: "enquiries", action: "created", id: enquiry.id });
    res.status(201).json(enquiry);
  } catch (err) {
    next(err);
  }
}

export async function updateEnquiry(req, res, next) {
  try {
    const enquiry = await enquiriesService.updateEnquiry(req.params.id, req.body);
    notifyDataChanged({ entity: "enquiries", action: "updated", id: enquiry.id });
    res.json(enquiry);
  } catch (err) {
    next(err);
  }
}

export async function deleteEnquiry(req, res, next) {
  try {
    await enquiriesService.deleteEnquiry(req.params.id);
    notifyDataChanged({ entity: "enquiries", action: "deleted", id: req.params.id });
    res.json({ success: true, message: "Enquiry deleted successfully." });
  } catch (err) {
    res.status(err.statusCode || 500).json({
      success: false,
      error: err.message || "Failed to delete enquiry.",
    });
  }
}

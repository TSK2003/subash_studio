import * as enquiriesService from "../services/enquiriesService.js";

export async function getAllEnquiries(req, res, next) {
  try {
    const enquiries = await enquiriesService.getAllEnquiries();
    res.json(enquiries);
  } catch (err) {
    next(err);
  }
}

export async function createEnquiry(req, res, next) {
  try {
    const enquiry = await enquiriesService.createEnquiry(req.body);
    res.status(201).json(enquiry);
  } catch (err) {
    next(err);
  }
}

export async function updateEnquiry(req, res, next) {
  try {
    const enquiry = await enquiriesService.updateEnquiry(req.params.id, req.body);
    res.json(enquiry);
  } catch (err) {
    next(err);
  }
}

export async function deleteEnquiry(req, res, next) {
  try {
    await enquiriesService.deleteEnquiry(req.params.id);
    res.json({ success: true, message: "Enquiry deleted successfully." });
  } catch (err) {
    next(err);
  }
}

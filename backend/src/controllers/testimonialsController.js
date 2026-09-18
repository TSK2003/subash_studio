import * as testimonialsService from "../services/testimonialsService.js";

export async function getAllTestimonials(req, res, next) {
  try {
    const adminView = req.query.admin === "true" || Boolean(req.user);
    const testimonials = await testimonialsService.getAllTestimonials(adminView);
    res.json(testimonials);
  } catch (err) {
    next(err);
  }
}

export async function createTestimonial(req, res, next) {
  try {
    const testimonial = await testimonialsService.createTestimonial(req.body);
    res.status(201).json(testimonial);
  } catch (err) {
    next(err);
  }
}

export async function updateTestimonial(req, res, next) {
  try {
    const testimonial = await testimonialsService.updateTestimonial(req.params.id, req.body);
    res.json(testimonial);
  } catch (err) {
    next(err);
  }
}

export async function deleteTestimonial(req, res, next) {
  try {
    await testimonialsService.deleteTestimonial(req.params.id);
    res.json({ success: true, message: "Testimonial deleted successfully." });
  } catch (err) {
    next(err);
  }
}

export async function toggleApproved(req, res, next) {
  try {
    const testimonial = await testimonialsService.toggleTestimonialApproved(req.params.id);
    res.json(testimonial);
  } catch (err) {
    next(err);
  }
}

export async function toggleFeatured(req, res, next) {
  try {
    const testimonial = await testimonialsService.toggleTestimonialFeatured(req.params.id);
    res.json(testimonial);
  } catch (err) {
    next(err);
  }
}

export async function toggleHidden(req, res, next) {
  try {
    const testimonial = await testimonialsService.toggleTestimonialHidden(req.params.id);
    res.json(testimonial);
  } catch (err) {
    next(err);
  }
}

export async function getGoogleMeta(req, res, next) {
  try {
    const meta = await testimonialsService.getGoogleReviewsMeta();
    res.json(meta);
  } catch (err) {
    next(err);
  }
}

export async function syncReviews(req, res, next) {
  try {
    const reviews = Array.isArray(req.body) ? req.body : req.body.reviews || [];
    const result = await testimonialsService.syncGoogleReviews(reviews);
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
}

import * as filmsService from "../services/filmsService.js";

export async function getAllFilms(req, res, next) {
  try {
    const includeUnpublished = req.query.all === "true" || Boolean(req.user);
    const films = await filmsService.getAllFilms(includeUnpublished);
    res.json(films);
  } catch (err) {
    next(err);
  }
}

export async function createFilm(req, res, next) {
  try {
    const film = await filmsService.createFilm(req.body);
    res.status(201).json(film);
  } catch (err) {
    next(err);
  }
}

export async function updateFilm(req, res, next) {
  try {
    const film = await filmsService.updateFilm(req.params.id, req.body);
    res.json(film);
  } catch (err) {
    next(err);
  }
}

export async function deleteFilm(req, res, next) {
  try {
    await filmsService.deleteFilm(req.params.id);
    res.json({ success: true, message: "Film deleted successfully." });
  } catch (err) {
    next(err);
  }
}

export async function toggleFeatured(req, res, next) {
  try {
    const film = await filmsService.toggleFilmFeatured(req.params.id);
    res.json(film);
  } catch (err) {
    next(err);
  }
}

export async function togglePublished(req, res, next) {
  try {
    const film = await filmsService.toggleFilmPublished(req.params.id);
    res.json(film);
  } catch (err) {
    next(err);
  }
}

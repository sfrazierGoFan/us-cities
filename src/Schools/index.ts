import { SchoolsController } from "./SchoolsController";
import express from "express";

const controller = new SchoolsController();
const SchoolsRouter = express.Router();

SchoolsRouter.get("/schools/:huddleId", async (req, res, _next) => {
  const huddleId = req.params.huddleId;
  const school = await controller.getSchool(huddleId);
  if (!school) res.status(404);
  else res.json(school);
  res.end();
});

SchoolsRouter.get("/search", async (req, res, _next) => {
  const q = req.query['q'];
  const lat = req.query['latitude'];
  const lng = req.query['longitude'];
  let query: string = '';
  if (Array.isArray(q) && typeof q[0] === 'string') {
    query = q[0];
  } else {
    query = `${q}`;
  }

  let geo: {latitude: number, longitude: number} | null = null;
  if (lat && lng) {
    geo = {
      latitude: parseFloat(`${lat}`),
      longitude: parseFloat(`${lng}`)
    };
  }

  const schools = await controller.searchSchools(query.split(' ').filter(s=>s!==''), geo);
  if (typeof schools === 'string') {
    res.status(500);
  }
  res.json(schools);
});

export { SchoolsRouter };

import { CitiesController } from "./CitiesController";
import { City, Geo } from "./City";
import express from "express";

const controller = new CitiesController();
const CitiesRouter = express.Router();

CitiesRouter.get("/:zip", async (req, res, _next) => {
    const zip = req.params.zip;
    const proximity = req.query['proximity'];

    if (proximity) {
        const distance = parseFloat(`${proximity!}`);
        const cities = await controller.getClosestCities(zip, distance);
        res.json(cities);
    } else {
        const city = await controller.getCity(zip);
        res.json(city);
    }
});

CitiesRouter.get("/location", async (req, res, _next) => {
    const lat = Number.parseFloat(JSON.stringify(req.query['lat']));
    const lng = Number.parseFloat(JSON.stringify(req.query['lng']));
    const proximity = Number.parseFloat(JSON.stringify(req.query['proximity']));
    if (!lat || !lng || !proximity || Number.isNaN(lat) || Number.isNaN(lng) || Number.isNaN(proximity)) {
        res.statusMessage = "Bad request - lat, lng, and proxmity required";
        res.status(400);
    } else {
        const cities = await controller.getClosestCitiesGeo(lat, lng, proximity);
        res.json(cities);
    }
});

export { CitiesRouter, City, Geo };

import { CitiesController } from "./CitiesController";
import express from "express";

const controller = new CitiesController();

const CitiesRouter = express.Router();

/*
CitiesRouter.get("/city/:zip?proximity=:proximity", (req, res, _next) => {
    const zip = req.params.zip;
    const proximity = req.query.proximity;
    const cities = controller.getClosestCities(zip, proximity);
    res.json(cities);
});
*/

CitiesRouter.get("/city/:zip", async (req, res, _next) => {
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

export { CitiesRouter };

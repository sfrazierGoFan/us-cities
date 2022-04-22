import express from 'express';
import { CitiesRouter } from './Cities';

const app = express();

app.use("/", CitiesRouter);

module.exports = app;

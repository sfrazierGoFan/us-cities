import express from 'express';
import { CitiesRouter } from './Cities';
import { SchoolsRouter } from './Schools';

const app = express();

app.use("/city", CitiesRouter);
app.use("/", SchoolsRouter);

module.exports = app;

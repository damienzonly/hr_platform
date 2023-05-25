import express from 'express'
import morgan from 'morgan';
import cors from 'cors';

export const app = express();
app.use(
    express.json(),
    express.urlencoded({extended: true}),
    morgan('combined'),
    cors()
)
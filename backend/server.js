import express from 'express';
import dotenv from 'dotenv';
dotenv.config();
import cookieParser from 'cookie-parser';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import connectDB from './config/db.js';

const port = process.env.PORT || 5000;

import userRoutes from './routes/userRoutes.js';

connectDB();

const app = express();

app.use(express.json());    // allow us to parse JSON
app.use(express.urlencoded({ extended: true }));    // allow us to send form data

app.use(cookieParser());

app.use('/api/users', userRoutes);

app.get('/', (req, res) => res.send('Server is ready'));

app.use(notFound);
app.use(errorHandler);

app.listen(port, () => console.log(`Server running on port ${port}`));
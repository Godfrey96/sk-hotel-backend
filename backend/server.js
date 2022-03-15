import express from 'express';
import { config } from 'dotenv';
import colors from 'colors';
import path from 'path';
import morgan from 'morgan';
import cors from 'cors';
import connectDB from './config/db.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

import categoriesRoutes from './routes/categoriesRoutes.js';
import roomsRoutes from './routes/roomRoutes.js';
import usersRoutes from './routes/userRoutes.js'
import ordersRoutes from './routes/orderRoutes.js';

config();

const app = express();

app.use(cors());

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

app.use(express.json());

connectDB();

app.get('/', (req, res) => {
    res.send('API is running')
})

// categories routes
app.use('/api/v1/categories', categoriesRoutes);
// rooms routes
app.use('/api/v1/rooms', roomsRoutes);
// users routes
app.use('/api/v1/users', usersRoutes);
// orders routes
app.use('/api/v1/orders', ordersRoutes);

const __dirname = path.resolve();
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

app.use(notFound)
app.use(errorHandler)

const PORT = process.env.PORT || 5000

app.listen(PORT, console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold))
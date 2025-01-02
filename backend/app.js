import express from 'express';
import morgan from 'morgan';
import connect from './db/db.js';
import userRoutes from './routes/user.routes.js';
import projectRoute from './routes/project.routes.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import aiRoutes from './routes/ai.routes.js'
const app = express();

connect();

app.use(morgan('dev'));
// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors());
// Routes

app.use('/users', userRoutes);
app.use('/project', projectRoute);
app.use('/ai', aiRoutes);
app.get('/', (req, res) => {
  res.send('Hello, World!');
});

export default app;


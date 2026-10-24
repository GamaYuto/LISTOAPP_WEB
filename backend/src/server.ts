import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import authRoutes from './routes/auth.routes';
import serviceRoutes from './routes/service.routes';
import offerRoutes from './routes/offer.routes';
import windowQuoteRoutes from './routes/windowQuote.routes';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', message: 'ListoApp Backend is running!' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/offers', offerRoutes);
app.use('/api/window-quotes', windowQuoteRoutes);

app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`Server is running on http://0.0.0.0:${PORT}`);
});

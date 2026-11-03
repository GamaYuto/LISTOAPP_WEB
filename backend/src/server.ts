import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import authRoutes from './routes/auth.routes';
import serviceRoutes from './routes/service.routes';
import offerRoutes from './routes/offer.routes';
import windowQuoteRoutes from './routes/windowQuote.routes';

const app = express();
const PORT = process.env.PORT || 3000;

const rawFrontendUrls = process.env.FRONTEND_URL;
const allowedOrigins = rawFrontendUrls
  ? rawFrontendUrls.split(',').map((url) => url.trim())
  : ['*'];

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // Permitir solicitudes sin origen (como curl, Postman o apps móviles)
    if (!origin) return callback(null, true);

    // Si se especificó '*' o el origen está en la lista de FRONTEND_URL
    if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // Permitir orígenes locales y de red LAN (localhost, 127.0.0.1, 192.168.x.x, 10.x.x.x, etc.)
    const isLocalOrLan = /^https?:\/\/(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+)(:\d+)?$/.test(
      origin
    );
    if (isLocalOrLan) {
      return callback(null, true);
    }

    return callback(new Error(`Origin ${origin} not allowed by CORS`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
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

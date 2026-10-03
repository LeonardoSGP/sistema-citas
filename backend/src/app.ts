import express from 'express';
import cors from 'cors';
import { config } from './config/env';
import { errorHandler } from './middleware/errorHandler';
import authRoutes from './routes/auth.routes';
import patientsRoutes from './routes/patients.routes';
import appointmentsRoutes from './routes/appointments.routes';
import sessionNotesRoutes from './routes/sessionNotes.routes';

const app = express();

app.use(cors({
  origin: config.frontendUrl,
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (_req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/patients', patientsRoutes);
app.use('/api/appointments', appointmentsRoutes);
app.use('/api/session-notes', sessionNotesRoutes);

app.use(errorHandler);

const port = config.port;
app.listen(port, () => {
  console.log(`Servidor ejecutándose en http://localhost:${port}`);
});

export default app;

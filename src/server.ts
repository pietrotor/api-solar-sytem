import 'dotenv/config';
import path from 'path';
import express from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import cors from 'cors';

import routes from './routes';

const app = express();
// Configuración de Swagger
const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API de Planetas',
      version: '1.0.0',
      description: 'Una API simple para obtener información sobre planetas',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Servidor local',
      },
    ],
  },
  apis: ['./src/routes.ts'], // Ruta a los archivos que contienen las rutas
};
const specs = swaggerJsdoc(options);
app.use(express.json());
app.use(cors());

app.use('/api', routes);

app.use('/api', swaggerUi.serve, swaggerUi.setup(specs));

app.use(
  '/files/planets',
  express.static(path.resolve(__dirname, 'assets', 'planets')),
);

const port = process.env.PORT || 4000;

app.listen(port);

console.log(`🚀 Server started on port ${port}!`);

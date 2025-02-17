import { Router, Request, Response } from 'express';

import data from './data_es.json';

const routes = Router();

/**
 * @swagger
 * /planets:
 *   get:
 *     summary: Obtiene una lista de planetas con paginación y filtros
 *     parameters:
 *       - in: query
 *         name: filter
 *         schema:
 *           type: string
 *         description: Filtra los planetas por nombre
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         description: Ordena los planetas por nombre (ascendente o descendente)
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Número de página para la paginación
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Número de elementos por página
 *     responses:
 *       200:
 *         description: Retorna una lista de planetas paginada y filtrada
 */
routes.get(
  '/planets',
  async (request: Request, response: Response): Promise<Response> => {
    let { filter, sort, page, limit } = request.query;

    const pageNum = page ? parseInt(page as string, 10) : 1;
    const limitNum = limit ? parseInt(limit as string, 10) : 5;

    let planets = [...data.planets];

    if (filter) {
      const filterText = (filter as string)
        .toLocaleLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
      planets = planets.filter(planet =>
        planet.name
          .toLocaleLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .includes(filterText),
      );
    }

    if (sort && (sort === 'asc' || sort === 'desc')) {
      planets.sort((a, b) => {
        if (sort === 'asc') return a.name.localeCompare(b.name);
        if (sort === 'desc') return b.name.localeCompare(a.name);
        return 0;
      });
    }

    const startIndex = (pageNum - 1) * limitNum;
    const paginatedPlanets = planets.slice(startIndex, startIndex + limitNum);

    const totalPages = Math.ceil(planets.length / limitNum);

    return response.json({
      total: planets.length,
      page: pageNum,
      limit: limitNum,
      totalPages,
      results: paginatedPlanets,
    });
  },
);

/**
 * @swagger
 * /planets/{name}:
 *   get:
 *     summary: Obtiene un planeta por su nombre
 *     parameters:
 *       - in: path
 *         name: name
 *         schema:
 *           type: string
 *         required: true
 *         description: Nombre del planeta
 *     responses:
 *       200:
 *         description: Retorna el planeta encontrado
 *       404:
 *         description: Planeta no encontrado
 */
routes.get(
  '/planets/:name',
  async (request: Request, response: Response): Promise<Response> => {
    const { name } = request.params;

    const planet = data.planets.find(
      planet =>
        planet.name
          .toLocaleLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '') ===
        name
          .toLocaleLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, ''),
    );

    if (!planet) {
      return response.status(404).json({ error: 'Planeta no encontrado' });
    }

    return response.json(planet);
  },
);

export default routes;

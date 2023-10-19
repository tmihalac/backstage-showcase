import { errorHandler } from '@backstage/backend-common';
import express from 'express';
import Router from 'express-promise-router';
import { Logger } from 'winston';
import { createQuayRepository, updateQuayRepository, deleteQuayRepository} from './createQuayRepo';

export interface RouterOptions {
  logger: Logger;
}

export interface CreateRepoParams {
  repository: string;
  visibility: string;
  namespace: string;
  description: string;
}

export interface UpdateRepoParams {
  description: string;
}

export async function createRouter(
  options: RouterOptions,
): Promise<express.Router> {
  const { logger } = options;

  const router = Router();
  router.use(express.json());

  router.get('/health', (_, response) => {
    logger.info('PONG!');
    response.json({ status: 'ok' });
  });

  router.post('/create', async (request, res) => {
    logger.info('Create Quay Repo!');

    const params: CreateRepoParams = request.body;

    const responseBodyPromise = await createQuayRepository(params, logger);

    logger.info(JSON.stringify(responseBodyPromise));

    res.status(200).send(JSON.stringify(responseBodyPromise))
  });

  router.put('/update/:namespace/:repository', async (request, res) => {
    logger.info('Update Quay Repo!');

    const params: UpdateRepoParams = request.body;
    const namespace: string = request.params.namespace;
    const repository: string = request.params.repository;

    const responseBodyPromise = await updateQuayRepository(namespace, repository, params, logger);

    logger.info(JSON.stringify(responseBodyPromise));

    res.status(200).send(JSON.stringify(responseBodyPromise))
  });

  router.delete('/delete/:namespace/:repository', async (request, res) => {
    logger.info('Delete Quay Repo!');

    const repository: string = request.params.repository;
    const namespace: string = request.params.namespace;

    await deleteQuayRepository(namespace, repository, logger);

    res.status(200).send('')
  });

  router.use(errorHandler());
  return router;
}

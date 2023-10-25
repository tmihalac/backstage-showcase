import { Logger } from 'winston';
import {CreateRepoParams, UpdateRepoParams} from "./router";
import { Config } from '@backstage/config'

export interface ResponseBody {
  namespace: string;
  name: string;
  kind: string;
}
export interface ResponseErrorBody {
  detail: string;
  error_message: string;
  error_type: string;
  title: string;
  type: string;
  status: number;
}
interface CreateRequestBody {
  repository: string;
  visibility: string;
  namespace?: string;
  description: string;
  repo_kind?: string;
}

interface UpdateRequestBody {
  description: string;
}

const isValueValid = (
  value: string | undefined,
  valueName: string,
  valueOpts: Array<string | undefined>,
) => {
  if (valueOpts.includes(value)) {
    return;
  }
  throw new Error(
    `For the "${valueName}" parameter "${value}" is not a valid option,` +
    ` available options are: ${valueOpts.map(v => v || 'none').join(', ')}`,
  );
};

function readConfiguration(config: Config) {
  const token = config.getOptionalString('quay-backend-plugin.token');
  const baseUrl = config.getOptionalString('quay-backend-plugin.url');
  return {token, baseUrl};
}

export async function getByNameQuayRepository(config: Config, namespace: string, repository: string, logger: Logger) {
  const {token, baseUrl} = readConfiguration(config);
  const uri = encodeURI(`${baseUrl}/api/v1/repository/${namespace}/${repository}`);

  logger.info('uri ' + uri)
  const response = await fetch(uri, {
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
    method: 'GET',
  });

  if (!response.ok) {
    const errorBody = (await response.json()) as ResponseErrorBody;
    const errorStatus = errorBody.status || response.status;
    // Some error responses don't have the structure defined in ResponseErrorBody
    const errorMsg = errorBody.detail || (errorBody as any).error;
    throw new Error(
      `Failed to get Quay repository, ${errorStatus} -- ${errorMsg}`,
    );
  }

  const res = (await response.json()) as ResponseBody;
  logger.info('response ' + JSON.stringify(res))

  return res;
}

export async function createQuayRepository(config: Config, createRepoParams: CreateRepoParams, logger: Logger) {
  const {token, baseUrl} = readConfiguration(config);
  const name = createRepoParams.repository;
  const visibility = createRepoParams.visibility;
  const namespace = createRepoParams.namespace;
  const description = createRepoParams.description;
  isValueValid(visibility, 'visibility', ['public', 'private']);

  const params: CreateRequestBody = {
    description,
    repository: name,
    visibility,
    namespace,
  };

  logger.info('params ' + JSON.stringify(params))

  const uri = encodeURI(`${baseUrl}/api/v1/repository`);

  logger.info('uri ' + uri)
  const response = await fetch(uri, {
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(params),
    method: 'POST',
  });

  if (!response.ok) {
    const errorBody = (await response.json()) as ResponseErrorBody;
    const errorStatus = errorBody.status || response.status;
    // Some error responses don't have the structure defined in ResponseErrorBody
    const errorMsg = errorBody.detail || (errorBody as any).error;
    throw new Error(
      `Failed to create Quay repository, ${errorStatus} -- ${errorMsg}`,
    );
  }

  const res = (await response.json()) as ResponseBody;
  logger.info('response ' + JSON.stringify(res))

  return res;
}

export async function updateQuayRepository(config: Config, namespace: string, repository: string, updateRepoParams: UpdateRepoParams, logger: Logger) {
  const description = updateRepoParams.description;
  const {token, baseUrl} = readConfiguration(config);

  const params: UpdateRequestBody = {
    description,
  };

  logger.info('params ' + JSON.stringify(params))

  const uri = encodeURI(`${baseUrl}/api/v1/repository/${namespace}/${repository}`);

  logger.info('uri ' + uri)
  const response = await fetch(uri, {
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(params),
    method: 'PUT',
  });

  if (!response.ok) {
    const errorBody = (await response.json()) as ResponseErrorBody;
    const errorStatus = errorBody.status || response.status;
    // Some error responses don't have the structure defined in ResponseErrorBody
    const errorMsg = errorBody.detail || (errorBody as any).error;
    throw new Error(
      `Failed to update Quay repository, ${errorStatus} -- ${errorMsg}`,
    );
  }

  var res = (await response.json()) as ResponseBody;
  logger.info('response ' + JSON.stringify(res))

  return res;
}

  export async function deleteQuayRepository(config: Config, namespace: string, repository: string, logger: Logger) {
  const {token, baseUrl} = readConfiguration(config);

  const uri = encodeURI(`${baseUrl}/api/v1/repository/${namespace}/${repository}`);

  logger.info('uri ' + uri)
  const response = await fetch(uri, {
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
    method: 'DELETE',
  });

  if (!response.ok || response.status != 204) {
    const errorBody = (await response.json()) as ResponseErrorBody;
    const errorStatus = errorBody.status || response.status;
    // Some error responses don't have the structure defined in ResponseErrorBody
    const errorMsg = errorBody.detail || (errorBody as any).error;
    throw new Error(
      `Failed to delete Quay repository, ${errorStatus} -- ${errorMsg}`,
    );
  }
}

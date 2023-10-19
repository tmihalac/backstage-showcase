import { Logger } from 'winston';
import {CreateRepoParams, UpdateRepoParams} from "./router";

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

const token = 'ZIf30NbjNDk5ctboBEmQjLwBipY1F0J7eTmTzwiG';

const getUrl = (url: string | undefined): string => {
  if (!url) {
    return 'https://quay.io';
  }
  try {
    // eslint-disable-next-line no-new
    new URL(url);
  } catch (error) {
    throw new Error('"baseUrl" is invalid');
  }
  return url;
};

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

export async function createQuayRepository(createRepoParams: CreateRepoParams, logger: Logger) {
  const name = createRepoParams.repository;
  const visibility = createRepoParams.visibility;
  const namespace = createRepoParams.namespace;
  const description = createRepoParams.description;
  const baseUrl = getUrl('https://quay.io');
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

  var res = (await response.json()) as ResponseBody;
  logger.info('response ' + JSON.stringify(res))

  return res;
}

export async function updateQuayRepository(namespace: string, repository: string, updateRepoParams: UpdateRepoParams, logger: Logger) {
  const description = updateRepoParams.description;
  const baseUrl = getUrl('https://quay.io');

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

export async function deleteQuayRepository(namespace: string, repository: string, logger: Logger) {
  const baseUrl = getUrl('https://quay.io');

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

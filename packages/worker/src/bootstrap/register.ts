import { workerConfig } from '../config/worker.config';
import { logger }       from '../utils/logger';

let registeredId: string | null = null;

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function attemptRegister(): Promise<boolean> {
  try {
    const response = await fetch(`${workerConfig.registryUrl}/api/registry/register`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        host:   workerConfig.host,
        port:   workerConfig.port,
        weight: workerConfig.weight,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      logger.warn('Registration rejected by registry', { status: response.status, body: text });
      return false;
    }

    const body = await response.json() as { success: boolean; data: { id: string } };

    if (!body.success || !body.data?.id) {
      logger.warn('Unexpected response from registry', { body });
      return false;
    }

    registeredId = body.data.id;

    logger.info('Successfully registered with registry', {
      id:   registeredId,
      addr: `${workerConfig.host}:${workerConfig.port}`,
    });

    return true;

  } catch (err) {

    logger.warn('Registry unreachable, will retry', {
      error: (err as Error).message,
    });
    return false;
  }
}


export async function registerWithRetry(): Promise<void> {
  const { retryAttempts, retryDelayMs } = workerConfig;

  for (let attempt = 1; attempt <= retryAttempts; attempt++) {
    logger.info(`Registration attempt ${attempt}/${retryAttempts}`);

    const success = await attemptRegister();
    if (success) return; 

    if (attempt < retryAttempts) {
    
      const delay = retryDelayMs * Math.pow(2, attempt - 1);
      logger.warn(`Retrying in ${delay / 1000}s...`);
      await sleep(delay);
    }
  }

  throw new Error(
    `Failed to register after ${retryAttempts} attempts. ` +
    `Is the Registry running at ${workerConfig.registryUrl}?`
  );
}


export function getRegisteredId(): string | null {
  return registeredId;
}
import { workerConfig } from '../config/worker.config';
import { getRegisteredId } from './register';
import { logger } from '../utils/logger';

async function deregister(): Promise<void> {
  const id = getRegisteredId();

  if (!id) {
    logger.warn('No registered ID found, skipping deregister');
    return;
  }

  try {
    const response = await fetch(
      `${workerConfig.registryUrl}/api/registry/deregister/${id}`,
      { method: 'DELETE' }
    );

    if (response.ok) {
      logger.info('Successfully deregistered from registry', { id });
    } else {
      logger.warn('Deregister returned non-OK status', { status: response.status });
    }
  } catch (err) {
    logger.warn('Could not deregister (registry may be down)', {
      error: (err as Error).message,
    });
  }
}

export function setupGracefulShutdown(server: ReturnType<typeof import('http').createServer>): void {

  async function shutdown(signal: string): Promise<void> {
    logger.info(`Received ${signal}, starting graceful shutdown...`);

    server.close(() => {
      logger.info('HTTP server closed');
    });

    await deregister();

    logger.info('Shutdown complete');
    process.exit(0);
  }

  process.on('SIGTERM', () => void shutdown('SIGTERM'));

  process.on('SIGINT',  () => void shutdown('SIGINT'));

  process.on('uncaughtException', (err) => {
    logger.error('Uncaught exception', { message: err.message, stack: err.stack });
    void shutdown('uncaughtException');
  });
}
import { ServerNode } from '@slb/shared';
import { registryClient } from './registry.client';
import { strategyRouter }  from '../core/strategy.router';
import { strategyRegistry } from '../core/strategy.registry';
import { logger }          from '../utils/logger';


export interface ProxyResult {
  success:    boolean;
  statusCode: number;
  data:       unknown;
  meta: {
    workerId:  string;
    workerAddr: string;
    strategy:  string;
    latencyMs: number;
  };
}

export class ProxyService {

  async forward(
    method:  string,
    path:    string,
    body:    unknown,
    headers: Record<string, string>,
  ): Promise<ProxyResult> {

    const servers = await registryClient.getHealthyServers();

    if (servers.length === 0) {
      logger.warn('No healthy servers available', {
        strategy: strategyRegistry.getActiveName(),
      });
      return {
        success:    false,
        statusCode: 503,
        data:       { error: 'No healthy servers available' },
        meta: {
          workerId:   'none',
          workerAddr: 'none',
          strategy:   strategyRegistry.getActiveName(),
          latencyMs:  0,
        },
      };
    }

    let picked: ServerNode;
    try {
      picked = strategyRouter.route(servers);
    } catch (err) {
      logger.error('Strategy routing failed', { error: (err as Error).message });
      return {
        success:    false,
        statusCode: 503,
        data:       { error: (err as Error).message },
        meta: {
          workerId:   'none',
          workerAddr: 'none',
          strategy:   strategyRegistry.getActiveName(),
          latencyMs:  0,
        },
      };
    }

    const workerAddr = `http://${picked.host}:${picked.port}`;
    const targetUrl  = `${workerAddr}${path}`;
    const startTime  = Date.now();

    logger.info('Routing request', {
      strategy:   strategyRegistry.getActiveName(),
      workerId:   picked.id,
      workerAddr: `${picked.host}:${picked.port}`,
      path,
    });

    void registryClient.incrementRequests(picked.id);

    try {
      const workerResponse = await fetch(targetUrl, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Accept':       'application/json',
          ...this.filterHeaders(headers),
        },
        body: method !== 'GET' && method !== 'HEAD'
          ? JSON.stringify(body)
          : undefined,
        signal: AbortSignal.timeout(10_000),
      });

      const latencyMs = Date.now() - startTime;
      const data = await workerResponse.json().catch(() => ({}));

      logger.info('Worker responded', {
        workerId:  picked.id,
        status:    workerResponse.status,
        latencyMs: `${latencyMs}ms`,
      });

      return {
        success:    workerResponse.ok,
        statusCode: workerResponse.status,
        data,
        meta: {
          workerId:   picked.id,
          workerAddr: `${picked.host}:${picked.port}`,
          strategy:   strategyRegistry.getActiveName(),
          latencyMs,
        },
      };

    } catch (err) {
      const latencyMs = Date.now() - startTime;
      logger.error('Worker request failed', {
        workerId:  picked.id,
        error:     (err as Error).message,
        latencyMs: `${latencyMs}ms`,
      });

      return {
        success:    false,
        statusCode: 502,
        data:       { error: 'Worker unreachable', workerId: picked.id },
        meta: {
          workerId:   picked.id,
          workerAddr: `${picked.host}:${picked.port}`,
          strategy:   strategyRegistry.getActiveName(),
          latencyMs,
        },
      };

    } finally {
      void registryClient.decrementRequests(picked.id);
    }
  }

  private filterHeaders(headers: Record<string, string>): Record<string, string> {
    const allowed = ['x-request-id', 'x-correlation-id', 'accept-language'];
    return Object.fromEntries(
      Object.entries(headers).filter(([key]) =>
        allowed.includes(key.toLowerCase())
      )
    );
  }
}

export const proxyService = new ProxyService();
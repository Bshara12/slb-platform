import http from 'http';
import { registryService } from '../services/registry.service';
import { logger } from '../utils/logger';


const HEALTH_CHECK_INTERVAL_MS = 10_000; 
const HEALTH_CHECK_TIMEOUT_MS  = 3_000; 
const HEALTH_CHECK_PATH        = '/health';

function checkServer(
  host: string,
  port: number,
): Promise<{ alive: boolean; latency: number }> {
  return new Promise((resolve) => {
    const startTime = Date.now();

    const req = http.get(
      {
        hostname: host,
        port:     port,
        path:     HEALTH_CHECK_PATH,
        timeout:  HEALTH_CHECK_TIMEOUT_MS,
      },
      (res) => {
        const latency = Date.now() - startTime;
        const alive = res.statusCode !== undefined && res.statusCode < 300;

        res.resume();

        resolve({ alive, latency });
      },
    );

    req.on('timeout', () => {
      req.destroy();
      resolve({ alive: false, latency: HEALTH_CHECK_TIMEOUT_MS });
    });

    req.on('error', () => {
      const latency = Date.now() - startTime;
      resolve({ alive: false, latency });
    });
  });
}

async function runHealthChecks(): Promise<void> {
  const servers = registryService.getAllServers();

  if (servers.length === 0) return;

  const checks = servers.map(async (server) => {
    const { alive, latency } = await checkServer(server.host, server.port);
    const previousHealth = server.isHealthy;

    registryService.updateHealth(
      server.id,
      alive ? 'healthy' : 'unhealthy',
      latency,
    );

    if (previousHealth !== alive) {
      if (alive) {
        logger.info('Server recovered', {
          id:      server.id,
          addr:    `${server.host}:${server.port}`,
          latency: `${latency}ms`,
        });
      } else {
        logger.warn('Server marked unhealthy', {
          id:      server.id,
          addr:    `${server.host}:${server.port}`,
          latency: `${latency}ms`,
        });
      }
    }
  });

  await Promise.allSettled(checks);
}

export function startHealthChecker(): void {
  logger.info('Health checker started', {
    interval: `${HEALTH_CHECK_INTERVAL_MS / 1000}s`,
    timeout:  `${HEALTH_CHECK_TIMEOUT_MS / 1000}s`,
    path:     HEALTH_CHECK_PATH,
  });

  void runHealthChecks();
  setInterval(() => void runHealthChecks(), HEALTH_CHECK_INTERVAL_MS);
}
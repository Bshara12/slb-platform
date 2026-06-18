import { ServerNode } from '@slb/shared';
import { logger }     from '../utils/logger';

export class RegistryClient {
  private readonly baseUrl: string;

  constructor(registryUrl: string) {
    this.baseUrl = registryUrl.replace(/\/$/, '');
  }
  async getHealthyServers(): Promise<ServerNode[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/api/registry/servers/healthy`,
        {
          headers: { 'Accept': 'application/json' },
          signal: AbortSignal.timeout(5000),
        }
      );

      if (!response.ok) {
        logger.warn('Registry returned non-OK status', {
          status: response.status,
          url:    `${this.baseUrl}/api/registry/servers/healthy`,
        });
        return [];
      }

      const body = await response.json() as {
        success: boolean;
        data:    ServerNode[];
      };

      if (!body.success || !Array.isArray(body.data)) {
        logger.warn('Unexpected response shape from Registry', { body });
        return [];
      }

      return body.data;

    } catch (err) {

      logger.error('Failed to reach Registry', {
        error: (err as Error).message,
        url:   this.baseUrl,
      });
      return [];
    }
  }

  async incrementRequests(serverId: string): Promise<void> {
    try {
      await fetch(
        `${this.baseUrl}/api/registry/servers/${serverId}/requests/increment`,
        { method: 'PATCH', signal: AbortSignal.timeout(2000) }
      );
    } catch (err) {
      logger.warn('Failed to increment request count', { serverId, error: (err as Error).message });
    }
  }

  async decrementRequests(serverId: string): Promise<void> {
    try {
      await fetch(
        `${this.baseUrl}/api/registry/servers/${serverId}/requests/decrement`,
        { method: 'PATCH', signal: AbortSignal.timeout(2000) }
      );
    } catch (err) {
      logger.warn('Failed to decrement request count', { serverId, error: (err as Error).message });
    }
  }
}

const REGISTRY_URL = process.env.REGISTRY_URL ?? 'http://localhost:3001';
export const registryClient = new RegistryClient(REGISTRY_URL);
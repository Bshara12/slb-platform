import { v4 as uuidv4 } from 'uuid';
import { ServerNode, HealthStatus } from '@slb/shared';
import { logger } from '../utils/logger';
import { NotFoundError, ConflictError } from '../errors/app-error';


export class RegistryService {

  private servers: Map<string, ServerNode> = new Map();


  register(input: { host: string; port: number; weight?: number }): ServerNode {
    const duplicate = this.findByHostPort(input.host, input.port);
    if (duplicate) {
    
      logger.warn('Re-registration detected, updating', {
        id: duplicate.id,
        host: input.host,
        port: input.port,
      });
      return this.refresh(duplicate.id);
    }

    const node: ServerNode = {
      id:             uuidv4(),
      host:           input.host,
      port:           input.port,
      weight:         input.weight ?? 1,
      activeRequests: 0,
      isHealthy:      true,       
      lastLatency:    0,
      registeredAt:   new Date().toISOString(),
      lastHeartbeat:  new Date().toISOString(),
    };

    this.servers.set(node.id, node);

    logger.info('Server registered', {
      id:   node.id,
      addr: `${node.host}:${node.port}`,
    });

    return node;
  }


  deregister(id: string): void {
    const node = this.servers.get(id);
    if (!node) {
      throw NotFoundError(`Server with id "${id}" not found`);
    }

    this.servers.delete(id);
    logger.info('Server deregistered', { id, addr: `${node.host}:${node.port}` });
  }


  getAllServers(): ServerNode[] {
    return Array.from(this.servers.values());
  }


  getHealthyServers(): ServerNode[] {
    return this.getAllServers().filter(s => s.isHealthy);
  }


  updateHealth(id: string, status: HealthStatus, latency?: number): void {
    const node = this.servers.get(id);
    if (!node) return; 

    node.isHealthy     = status === 'healthy';
    node.lastHeartbeat = new Date().toISOString();

    if (latency !== undefined) {
      node.lastLatency = latency;
    }

    this.servers.set(id, node);
  }


  incrementRequests(id: string): void {
    const node = this.servers.get(id);
    if (node) {
      node.activeRequests++;
      this.servers.set(id, node);
    }
  }

  decrementRequests(id: string): void {
    const node = this.servers.get(id);
    if (node && node.activeRequests > 0) {
      node.activeRequests--;
      this.servers.set(id, node);
    }
  }


  getById(id: string): ServerNode | undefined {
    return this.servers.get(id);
  }


  private findByHostPort(host: string, port: number): ServerNode | undefined {
    return this.getAllServers().find(s => s.host === host && s.port === port);
  }

  private refresh(id: string): ServerNode {
    const node = this.servers.get(id)!;
    node.lastHeartbeat = new Date().toISOString();
    node.isHealthy     = true;
    this.servers.set(id, node);
    return node;
  }
}


export const registryService = new RegistryService();
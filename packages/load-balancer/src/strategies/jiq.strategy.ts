import { ServerNode } from '@slb/shared';
import { ILoadBalancerStrategy } from '../core/strategy.interface';

export class JIQStrategy implements ILoadBalancerStrategy {
  readonly name = 'jiq' as const;

  pick(servers: ServerNode[]): ServerNode {
    if (servers.length === 0) throw new Error('No servers available');
    if (servers.length === 1) return servers[0];

    const idle = servers.filter(s => s.activeRequests === 0);

    if (idle.length > 0) {
      return idle[Math.floor(Math.random() * idle.length)];
    }
    
    return servers.reduce((best, current) =>
      current.activeRequests < best.activeRequests ? current : best
    );
  }

  getIdleCount(servers: ServerNode[]): number {
    return servers.filter(s => s.activeRequests === 0).length;
  }
}
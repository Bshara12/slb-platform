import { ServerNode } from '@slb/shared';
import { ILoadBalancerStrategy } from '../core/strategy.interface';

export class LatencyBasedStrategy implements ILoadBalancerStrategy {
  readonly name = 'latency-based' as const;

  private readonly alpha = 0.3;

  private latencyMap: Map<string, number> = new Map();

  pick(servers: ServerNode[]): ServerNode {
    if (servers.length === 0) throw new Error('No servers available');
    if (servers.length === 1) return servers[0];

    servers.forEach(server => {
      if (server.lastLatency > 0) {
        const prev = this.latencyMap.get(server.id);
        if (prev === undefined) {
          this.latencyMap.set(server.id, server.lastLatency);
        } else {
          const updated = prev * (1 - this.alpha) + server.lastLatency * this.alpha;
          this.latencyMap.set(server.id, updated);
        }
      } else if (!this.latencyMap.has(server.id)) {
        this.latencyMap.set(server.id, 100);
      }
    });

    return servers.reduce((best, current) => {
      const bestLat   = this.latencyMap.get(best.id)    ?? 100;
      const currentLat = this.latencyMap.get(current.id) ?? 100;
      return currentLat < bestLat ? current : best;
    });
  }

  getLatencyMap(): Record<string, number> {
    return Object.fromEntries(
      Array.from(this.latencyMap.entries()).map(([k, v]) => [k, Math.round(v)])
    );
  }
}
import { ServerNode } from '@slb/shared';
import { ILoadBalancerStrategy } from '../core/strategy.interface';

export class GreedyStrategy implements ILoadBalancerStrategy {
  readonly name = 'greedy' as const;

  pick(servers: ServerNode[]): ServerNode {
    if (servers.length === 0) {
      throw new Error('No servers available');
    }

    return servers.reduce((best, current) => {
      const bestScore    = this.score(best);
      const currentScore = this.score(current);
      return currentScore < bestScore ? current : best;
    });
  }

  private score(server: ServerNode): number {

    const latency  = server.lastLatency > 0 ? server.lastLatency : 50;
    const requests = server.activeRequests;
    return (requests + 1) * (latency + 1);
  }

  getScore(server: ServerNode): number {
    return this.score(server);
  }
}
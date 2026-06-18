import { ServerNode } from '@slb/shared';
import { ILoadBalancerStrategy } from '../core/strategy.interface';

export class ResourceAwareStrategy implements ILoadBalancerStrategy {
  readonly name = 'resource-aware' as const;

  private readonly weights = {
    activeRequests: 0.6,
    latency:        0.4,
  };

  pick(servers: ServerNode[]): ServerNode {
    if (servers.length === 0) throw new Error('No servers available');
    if (servers.length === 1) return servers[0];

    const maxReqs   = Math.max(...servers.map(s => s.activeRequests), 1);
    const maxLatency = Math.max(...servers.map(s => s.lastLatency), 1);

    const scored = servers.map(server => ({
      server,
      score: this.computeScore(server, maxReqs, maxLatency),
    }));

    return scored.reduce((best, current) =>
      current.score < best.score ? current : best
    ).server;
  }

  private computeScore(
    server: ServerNode,
    maxReqs: number,
    maxLatency: number,
  ): number {
    const normalizedReqs    = server.activeRequests / maxReqs;
    const normalizedLatency = (server.lastLatency || 0) / maxLatency;

    return (
      normalizedReqs    * this.weights.activeRequests +
      normalizedLatency * this.weights.latency
    );
  }

  getScores(servers: ServerNode[]): Record<string, number> {
    const maxReqs    = Math.max(...servers.map(s => s.activeRequests), 1);
    const maxLatency = Math.max(...servers.map(s => s.lastLatency), 1);
    return Object.fromEntries(
      servers.map(s => [s.id, Math.round(this.computeScore(s, maxReqs, maxLatency) * 100) / 100])
    );
  }
}
import { ServerNode } from '@slb/shared';
import { ILoadBalancerStrategy } from '../core/strategy.interface';

export class AdaptiveStrategy implements ILoadBalancerStrategy {
  readonly name = 'adaptive' as const;

  private weights: Map<string, number> = new Map();

  private readonly learningRate = 0.15;

  private readonly minWeight = 0.1;
  private readonly maxWeight = 5.0;

  pick(servers: ServerNode[]): ServerNode {
    if (servers.length === 0) throw new Error('No servers available');
    if (servers.length === 1) return servers[0];

    servers.forEach(s => {
      if (!this.weights.has(s.id)) this.weights.set(s.id, 1.0);
    });

    this.updateWeights(servers);

    return this.weightedRandom(servers);
  }

  private updateWeights(servers: ServerNode[]): void {
    const latencies = servers.map(s => s.lastLatency || 50);
    const avgLatency = latencies.reduce((a, b) => a + b, 0) / latencies.length;

    servers.forEach(server => {
      const currentWeight = this.weights.get(server.id) ?? 1.0;
      const latency = server.lastLatency || avgLatency;

      const ratio = avgLatency / latency;
      const newWeight = currentWeight + this.learningRate * (ratio - 1.0);

      this.weights.set(
        server.id,
        Math.max(this.minWeight, Math.min(this.maxWeight, newWeight))
      );
    });
  }

  private weightedRandom(servers: ServerNode[]): ServerNode {
    const totalWeight = servers.reduce(
      (sum, s) => sum + (this.weights.get(s.id) ?? 1.0),
      0
    );

    let random = Math.random() * totalWeight;

    for (const server of servers) {
      random -= this.weights.get(server.id) ?? 1.0;
      if (random <= 0) return server;
    }

    return servers[servers.length - 1];
  }

  getCurrentWeights(): Record<string, number> {
    return Object.fromEntries(
      Array.from(this.weights.entries()).map(([k, v]) => [k, Math.round(v * 100) / 100])
    );
  }
}
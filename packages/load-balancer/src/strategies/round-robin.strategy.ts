import { ServerNode } from '@slb/shared';
import { ILoadBalancerStrategy } from '../core/strategy.interface';

export class RoundRobinStrategy implements ILoadBalancerStrategy {
  readonly name = 'round-robin' as const;

  private counter: number = 0;

  pick(servers: ServerNode[]): ServerNode {
    if (servers.length === 0) {
      throw new Error('No servers available');
    }

    const index = this.counter % servers.length;
    this.counter++;

    return servers[index];
  }

  getCurrentIndex(): number {
    return this.counter;
  }

  reset(): void {
    this.counter = 0;
  }
}
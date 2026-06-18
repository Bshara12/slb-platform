import { ServerNode } from '@slb/shared';
import { ILoadBalancerStrategy } from '../core/strategy.interface';

export class RandomStrategy implements ILoadBalancerStrategy {
  readonly name = 'random' as const;

  pick(servers: ServerNode[]): ServerNode {
    if (servers.length === 0) {
      throw new Error('No servers available');
    }
    const index = Math.floor(Math.random() * servers.length);
    return servers[index];
  }
}
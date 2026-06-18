import { ServerNode } from '@slb/shared';
import { ILoadBalancerStrategy } from '../core/strategy.interface';

export class SequentialStrategy implements ILoadBalancerStrategy {
  readonly name = 'sequential' as const;

  pick(servers: ServerNode[]): ServerNode {
  
    if (servers.length === 0) {
      throw new Error('No servers available');
    }

    return servers[0];
  }
}
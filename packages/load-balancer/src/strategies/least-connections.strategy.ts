import { ServerNode } from '@slb/shared';
import { ILoadBalancerStrategy } from '../core/strategy.interface';

export class LeastConnectionsStrategy implements ILoadBalancerStrategy {
  readonly name = 'least-connections' as const;

  pick(servers: ServerNode[]): ServerNode {
    if (servers.length === 0) {
      throw new Error('No servers available');
    }
    return servers.reduce((best, current) =>
      current.activeRequests < best.activeRequests ? current : best
    );
  }
}
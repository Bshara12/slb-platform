import { ServerNode } from '@slb/shared';
import { ILoadBalancerStrategy } from '../core/strategy.interface';

export class FilterDeadDecorator implements ILoadBalancerStrategy {
  get name() {
    return this.inner.name;
  }

  constructor(private readonly inner: ILoadBalancerStrategy) {}

  pick(servers: ServerNode[]): ServerNode {
    const healthy = servers.filter(s => s.isHealthy);

    if (healthy.length === 0) {

      throw new Error(
        `All servers are unhealthy. Original count: ${servers.length}`
      );
    }

    return this.inner.pick(healthy);
  }
}
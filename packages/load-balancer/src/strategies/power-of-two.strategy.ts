import { ServerNode } from '@slb/shared';
import { ILoadBalancerStrategy } from '../core/strategy.interface';

export class PowerOfTwoStrategy implements ILoadBalancerStrategy {
  readonly name = 'power-of-two' as const;

  pick(servers: ServerNode[]): ServerNode {
    if (servers.length === 0) {
      throw new Error('No servers available');
    }

    if (servers.length === 1) {
      return servers[0];
    }

    const indexA = Math.floor(Math.random() * servers.length);

  
    let indexB: number;
    do {
      indexB = Math.floor(Math.random() * servers.length);
    } while (indexB === indexA);

    const serverA = servers[indexA];
    const serverB = servers[indexB];

    return serverA.activeRequests <= serverB.activeRequests ? serverA : serverB;
  }
}
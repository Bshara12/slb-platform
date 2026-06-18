import { ServerNode } from '@slb/shared';
import { strategyRegistry } from './strategy.registry';

export class StrategyRouter {

  route(servers: ServerNode[]): ServerNode {
    const strategy = strategyRegistry.getActive();
    return strategy.pick(servers);
  }


  getActiveStrategyName(): string {
    return strategyRegistry.getActiveName();
  }
}

export const strategyRouter = new StrategyRouter();
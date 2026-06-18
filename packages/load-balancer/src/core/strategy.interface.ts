import { ServerNode, StrategyName } from '@slb/shared';

export interface ILoadBalancerStrategy {
  readonly name: StrategyName;
  pick(servers: ServerNode[]): ServerNode;
}


export type StrategyConstructor = new () => ILoadBalancerStrategy;
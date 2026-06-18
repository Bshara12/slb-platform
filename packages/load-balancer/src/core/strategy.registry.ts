import { StrategyName } from '@slb/shared'
import { ILoadBalancerStrategy } from './strategy.interface'
import { FilterDeadDecorator } from '../decorators/filter-dead.decorator'

import { SequentialStrategy } from '../strategies/sequential.strategy'
import { RoundRobinStrategy } from '../strategies/round-robin.strategy'
import { RandomStrategy } from '../strategies/random.strategy'
import { LeastConnectionsStrategy } from '../strategies/least-connections.strategy'
import { PowerOfTwoStrategy } from '../strategies/power-of-two.strategy'
import { GreedyStrategy } from '../strategies/greedy.strategy'
import { ConsistentHashingStrategy } from '../strategies/consistent-hashing.strategy'
import { LatencyBasedStrategy } from '../strategies/latency-based.strategy'
import { ResourceAwareStrategy } from '../strategies/resource-aware.strategy'
import { AdaptiveStrategy } from '../strategies/adaptive.strategy'
import { JIQStrategy } from '../strategies/jiq.strategy'

export class StrategyRegistry {
  private strategies: Map<StrategyName, ILoadBalancerStrategy> = new Map()
  private activeStrategyName: StrategyName = 'round-robin'

  constructor () {
    this.register(new SequentialStrategy())
    this.register(new RoundRobinStrategy())
    this.register(new RandomStrategy())
    this.register(new LeastConnectionsStrategy())
    this.register(new PowerOfTwoStrategy())
    this.register(new GreedyStrategy())
    this.register(new ConsistentHashingStrategy())
    this.register(new LatencyBasedStrategy())
    this.register(new ResourceAwareStrategy())
    this.register(new AdaptiveStrategy())
    this.register(new JIQStrategy())
  }

  register (strategy: ILoadBalancerStrategy): void {
    const wrapped = new FilterDeadDecorator(strategy)
    this.strategies.set(strategy.name, wrapped)
  }

  getActive (): ILoadBalancerStrategy {
    const strategy = this.strategies.get(this.activeStrategyName)
    if (!strategy) {
      throw new Error(`Active strategy "${this.activeStrategyName}" not found`)
    }
    return strategy
  }

  setActive (name: StrategyName): void {
    if (!this.strategies.has(name)) {
      throw new Error(`Strategy "${name}" is not registered`)
    }
    this.activeStrategyName = name
  }

  getActiveName (): StrategyName {
    return this.activeStrategyName
  }

  listAll (): StrategyName[] {
    return Array.from(this.strategies.keys())
  }
}

export const strategyRegistry = new StrategyRegistry()

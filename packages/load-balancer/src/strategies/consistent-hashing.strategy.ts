import { ServerNode } from '@slb/shared';
import { ILoadBalancerStrategy } from '../core/strategy.interface';

export class ConsistentHashingStrategy implements ILoadBalancerStrategy {
  readonly name = 'consistent-hashing' as const;

  private readonly virtualNodes = 150;

  private ring: Map<number, string> = new Map();
  private sortedPositions: number[] = [];
  private lastServerIds: string[] = [];

  private requestCounter = 0;

  pick(servers: ServerNode[]): ServerNode {
    if (servers.length === 0) throw new Error('No servers available');
    if (servers.length === 1) return servers[0];

    const currentIds = servers.map(s => s.id).sort().join(',');
    const lastIds = this.lastServerIds.sort().join(',');
    if (currentIds !== lastIds) {
      this.buildRing(servers);
      this.lastServerIds = servers.map(s => s.id);
    }

    const hash = this.hash(String(this.requestCounter++));
    const serverId = this.getServerForHash(hash);
    return servers.find(s => s.id === serverId) ?? servers[0];
  }

  private buildRing(servers: ServerNode[]): void {
    this.ring.clear();
    this.sortedPositions = [];

    servers.forEach(server => {
      for (let i = 0; i < this.virtualNodes; i++) {
        const pos = this.hash(`${server.id}-vnode-${i}`);
        this.ring.set(pos, server.id);
        this.sortedPositions.push(pos);
      }
    });

    this.sortedPositions.sort((a, b) => a - b);
  }

  private getServerForHash(hash: number): string {
    for (const pos of this.sortedPositions) {
      if (hash <= pos) return this.ring.get(pos)!;
    }
    return this.ring.get(this.sortedPositions[0])!;
  }

  private hash(key: string): number {
    let hash = 0;
    for (let i = 0; i < key.length; i++) {
      const char = key.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; 
    }
    return Math.abs(hash) % 1000000;
  }
}
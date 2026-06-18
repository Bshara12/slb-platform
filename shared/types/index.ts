export interface ServerNode {
  id: string
  host: string
  port: number
  weight: number
  activeRequests: number
  isHealthy: boolean
  lastLatency: number
  registeredAt: string
  lastHeartbeat: string
}

export type StrategyName =
  | 'round-robin'
  | 'random'
  | 'least-connections'
  | 'power-of-two'
  | 'greedy'
  | 'sequential'
  | 'consistent-hashing'
  | 'latency-based'
  | 'resource-aware'
  | 'adaptive'
  | 'jiq'

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  timestamp: string
}

export interface RequestMetric {
  serverId: string
  strategy: StrategyName
  latency: number
  statusCode: number
  timestamp: string
}

export type HealthStatus = 'healthy' | 'unhealthy' | 'degraded'


export interface WorkerConfig {
  workerId:    string;
  host:        string;
  port:        number;
  weight:      number; 
  registryUrl: string;  
  retryAttempts: number;
  retryDelayMs:  number; 
}

function loadConfig(): WorkerConfig {
  const port = parseInt(process.env.PORT ?? '4000', 10);

  return {
    workerId:    process.env.WORKER_ID    ?? `worker-${port}`,
    host:        process.env.WORKER_HOST  ?? 'localhost',
    port,
    weight:      parseInt(process.env.WORKER_WEIGHT ?? '1', 10),
    registryUrl: process.env.REGISTRY_URL ?? 'http://localhost:3001',
    retryAttempts: 5,
    retryDelayMs:  2000, 
  };
}

export const workerConfig = loadConfig();
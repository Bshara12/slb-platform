# Terminal 1 — Registry
npm run dev -w packages/registry

# Terminal 2 — Worker 1
$env:WORKER_ID="worker-1"; $env:PORT="4001"; $env:WORKER_HOST="localhost"; $env:REGISTRY_URL="http://localhost:3001"
npm run dev -w packages/worker

# Terminal 3 — Worker 2
$env:WORKER_ID="worker-2"; $env:PORT="4002"; $env:WORKER_HOST="localhost"; $env:REGISTRY_URL="http://localhost:3001"
npm run dev -w packages/worker

# Terminal 4 — Worker 3
$env:WORKER_ID="worker-3"; $env:PORT="4003"; $env:WORKER_HOST="localhost"; $env:REGISTRY_URL="http://localhost:3001"
npm run dev -w packages/worker

# Terminal 5 — Load Balancer
$env:REGISTRY_URL="http://localhost:3001"
npm run dev -w packages/load-balancer
# Smart Load Balancer Platform

A distributed systems engineering project built with Node.js, TypeScript, Express, and Docker.

This platform simulates how real-world load balancers distribute traffic across multiple servers while handling service discovery, health checks, fault tolerance, and runtime strategy switching.


## What is this project?

Smart Load Balancer Platform is a distributed system composed of four main services:

- Registry Service
- Load Balancer
- Worker Services
- Strategy Engine

The system dynamically distributes incoming requests across multiple worker servers using different load balancing algorithms such as:

- Round Robin
- Least Connections
- Random
- Sequential
- Power of Two Choices
- Greedy

It also supports:
- Service discovery
- Health checks
- Partial failure handling
- Graceful shutdown
- Runtime strategy switching

## Why did I build it?

I built this project to deeply understand distributed systems concepts by implementing them from scratch.

Instead of learning load balancing and service discovery only theoretically, I wanted to build a working system that demonstrates:

- How services discover each other
- How traffic is distributed intelligently
- How systems handle partial failures
- How fault-tolerant systems behave in production

This project helped me practice system design, backend architecture, and distributed systems engineering.

## System Architecture

```text
                ┌─────────────────────┐
                │   Registry Service  │
                │      Port 3001      │
                └──────────┬──────────┘
                           │
                    service discovery
                           │
                           ▼
Client ───────► Load Balancer (Port 3000)
                    │
                    │ choose strategy
         ┌──────────┼──────────┐
         ▼          ▼          ▼
     Worker-1    Worker-2    Worker-3
     Port 4001   Port 4002   Port 4003
```

## Key Technical Decisions

Strategy Pattern for algorithm switching:
Allows adding new balancing algorithms without 
modifying existing code — runtime switch with 
zero downtime.

Singleton for Registry:
Ensures one source of truth for all registered 
workers across the system.

Exponential Backoff on failure:
Prevents retry storms when a worker goes down.


## How it works

1. Workers register themselves in the Registry.
2. Load Balancer requests available healthy workers.
3. Strategy Engine selects the best worker.
4. Request is forwarded to selected worker.
5. Worker processes request and returns response.
6. Registry continuously health-checks workers.

## Tech Stack

- Node.js
- TypeScript
- Express.js
- Docker
- REST APIs
- Monorepo Architecture

## Run Locally

### Clone repository

git clone https://github.com/Bshara12/slb-platform.git
cd slb-platform
npm install
npm run dev -w packages/registry
PORT=4001 npm run dev -w packages/worker
PORT=4002 npm run dev -w packages/worker
PORT=4003 npm run dev -w packages/worker
npm run dev -w packages/load-balancer

Test request
POST http://localhost:3000/api/proxy

## Main Endpoints

Registry:
- GET /health
- GET /api/registry/servers
- POST /api/registry/register

Load Balancer:
- POST /api/proxy
- GET /api/lb/strategy
- PUT /api/lb/strategy

Workers:
- GET /health
- GET /stats
- POST /work

## Future Improvements

- Kubernetes deployment
- Redis-based shared registry
- Metrics dashboard using Prometheus + Grafana
- Auto scaling
- Advanced monitoring

## Demo Video
[Watch Demo](https://docs.google.com/videos/d/1FflbY5xvaTsFfYH0ALz-crgB8N5l0YiFgsraMgS0nlU/edit?usp=sharing)

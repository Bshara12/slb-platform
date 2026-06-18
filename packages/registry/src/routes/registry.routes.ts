import { Router, Request, Response, NextFunction } from 'express';
import { registryService } from '../services/registry.service';
import { validateRegisterBody } from '../middleware/validate';
import { logger } from '../utils/logger';
import { ApiResponse, ServerNode } from '@slb/shared';


export const registryRouter = Router();


registryRouter.post(
  '/register',
  validateRegisterBody,            
  (req: Request, res: Response, next: NextFunction) => {
    try {
      const { host, port, weight } = req.body as {
        host: string;
        port: number;
        weight?: number;
      };

      const node = registryService.register({ host, port, weight });

      const response: ApiResponse<ServerNode> = {
        success:   true,
        data:      node,
        timestamp: new Date().toISOString(),
      };

      res.status(201).json(response);
    } catch (err) {
      next(err); 
    }
  },
);


registryRouter.delete(
  '/deregister/:id',
  (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      registryService.deregister(id);

      const response: ApiResponse = {
        success:   true,
        data:      { message: `Server ${id} deregistered successfully` },
        timestamp: new Date().toISOString(),
      };

      res.json(response);
    } catch (err) {
      next(err);
    }
  },
);

registryRouter.get(
  '/servers',
  (_req: Request, res: Response) => {
    const servers = registryService.getAllServers();

    const response: ApiResponse<ServerNode[]> = {
      success:   true,
      data:      servers,
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  },
);


registryRouter.get(
  '/servers/healthy',
  (_req: Request, res: Response) => {
    const servers = registryService.getHealthyServers();

    const response: ApiResponse<ServerNode[]> = {
      success:   true,
      data:      servers,
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  },
);

registryRouter.patch(
  '/servers/:id/requests/increment',
  (req: Request, res: Response) => {
    registryService.incrementRequests(req.params.id);
    res.json({ success: true, timestamp: new Date().toISOString() });
  },
);

registryRouter.patch(
  '/servers/:id/requests/decrement',
  (req: Request, res: Response) => {
    registryService.decrementRequests(req.params.id);
    res.json({ success: true, timestamp: new Date().toISOString() });
  },
);


registryRouter.get(
  '/servers/:id',
  (req: Request, res: Response, next: NextFunction) => {
    try {
      const node = registryService.getById(req.params.id);
      if (!node) {
        res.status(404).json({
          success:   false,
          error:     `Server "${req.params.id}" not found`,
          timestamp: new Date().toISOString(),
        });
        return;
      }

      res.json({
        success:   true,
        data:      node,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      next(err);
    }
  },
);
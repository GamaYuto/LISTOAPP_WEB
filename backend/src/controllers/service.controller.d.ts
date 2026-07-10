import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
export declare const createServiceRequest: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getPendingServices: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getMyRequests: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=service.controller.d.ts.map
import { Request, Response } from 'express';
import serviceService from '../services/service.service';

export class ServiceController {
  async getTailorServices(req: Request, res: Response): Promise<void> {
    try {
      const tailorProfileId = req.params.tailorProfileId;
      const services = await serviceService.getTailorServices(tailorProfileId);
      res.status(200).json({
        success: true,
        data: services,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to fetch services',
      });
    }
  }

  async getServiceById(req: Request, res: Response): Promise<void> {
    try {
      const service = await serviceService.getServiceById(req.params.id);
      res.status(200).json({
        success: true,
        data: service,
      });
    } catch (error: any) {
      res.status(404).json({
        success: false,
        message: error.message || 'Service not found',
      });
    }
  }

  async createService(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }
      const service = await serviceService.createService(req.user.userId, req.body);
      res.status(201).json({
        success: true,
        message: 'Service created successfully',
        data: service,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to create service',
      });
    }
  }

  async updateService(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }
      const service = await serviceService.updateService(req.user.userId, req.params.id, req.body);
      res.status(200).json({
        success: true,
        message: 'Service updated successfully',
        data: service,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to update service',
      });
    }
  }

  async deleteService(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }
      const result = await serviceService.deleteService(req.user.userId, req.params.id);
      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to delete service',
      });
    }
  }
}

export default new ServiceController();

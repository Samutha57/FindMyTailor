import { Request, Response } from 'express';
import tailorService from '../services/tailor.service';

export class TailorController {
  async getAllTailors(req: Request, res: Response): Promise<void> {
    try {
      const search = req.query.search as string | undefined;
      const service = req.query.service as string | undefined;
      const tailors = await tailorService.getAllTailors(search, service);
      res.status(200).json({
        success: true,
        count: tailors.length,
        data: tailors,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch tailors',
      });
    }
  }

  async getTailorById(req: Request, res: Response): Promise<void> {
    try {
      const tailor = await tailorService.getTailorById(req.params.id);
      res.status(200).json({
        success: true,
        data: tailor,
      });
    } catch (error: any) {
      res.status(404).json({
        success: false,
        message: error.message || 'Tailor not found',
      });
    }
  }

  async getMyProfile(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }
      const profile = await tailorService.getProfileByUserId(req.user.userId);
      res.status(200).json({
        success: true,
        data: profile,
      });
    } catch (error: any) {
      res.status(404).json({
        success: false,
        message: error.message || 'Profile not found',
      });
    }
  }

  async updateMyProfile(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }
      const updated = await tailorService.updateProfile(req.user.userId, req.body);
      res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: updated,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to update profile',
      });
    }
  }
}

export default new TailorController();

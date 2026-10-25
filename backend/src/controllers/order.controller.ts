import { Request, Response } from 'express';
import orderService from '../services/order.service';

export class OrderController {
  async createOrder(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }
      const order = await orderService.createOrder(req.user.userId, req.body);
      res.status(201).json({
        success: true,
        message: 'Order placed successfully',
        data: order,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to place order',
      });
    }
  }

  async getCustomerOrders(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }
      const orders = await orderService.getCustomerOrders(req.user.userId);
      res.status(200).json({
        success: true,
        count: orders.length,
        data: orders,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch orders',
      });
    }
  }

  async getTailorOrders(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }
      const filter = req.query.filter as 'incoming' | 'active' | 'completed' | 'all' | undefined;
      const orders = await orderService.getTailorOrders(req.user.userId, filter);
      res.status(200).json({
        success: true,
        count: orders.length,
        data: orders,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to fetch tailor orders',
      });
    }
  }

  async getOrderById(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }
      const order = await orderService.getOrderById(
        req.params.id,
        req.user.userId,
        req.user.role
      );
      res.status(200).json({
        success: true,
        data: order,
      });
    } catch (error: any) {
      res.status(404).json({
        success: false,
        message: error.message || 'Order not found',
      });
    }
  }

  async updateOrderStatus(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }
      const { status, note } = req.body;
      const order = await orderService.updateOrderStatus(
        req.params.id,
        req.user.userId,
        status,
        note
      );
      res.status(200).json({
        success: true,
        message: `Order status updated to ${status}`,
        data: order,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to update order status',
      });
    }
  }
}

export default new OrderController();

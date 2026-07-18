import { Request, Response, NextFunction } from 'express';
import { analyticsService } from '../services/analytics.service';
import { startOfMonth, endOfMonth, startOfDay, endOfDay } from 'date-fns';

export const getDashboardAnalytics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { startDate, endDate } = req.query as { startDate?: string; endDate?: string };

    let start: Date;
    let end: Date;

    if (startDate && endDate) {
      start = startOfDay(new Date(startDate));
      end = endOfDay(new Date(endDate));
    } else {
      // Default to current month
      const now = new Date();
      start = startOfMonth(now);
      end = endOfMonth(now);
    }

    const data = await analyticsService.getDashboardAnalytics(start, end);

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const getWorkrates = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { date } = req.query as { date?: string };
    const anchor = date ? startOfDay(new Date(date)) : startOfDay(new Date());
    const data = await analyticsService.getTechnicianWorkrates(anchor);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

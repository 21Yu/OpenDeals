import { Router, Response } from 'express';
import { pool } from '../db/index.js';
import { authenticateJWT } from '../middleware/auth.js';
import type { AuthenticatedRequest } from '../types/types.js';

const notificationsRouter = Router();

notificationsRouter.get('/', authenticateJWT, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const result = await pool.query(
      `SELECT id, message, is_read, created_at
       FROM notifications
       WHERE user_id = $1
       ORDER BY created_at DESC, id DESC
       LIMIT 30`,
      [req.user?.userId]
    );
    const unreadResult = await pool.query(
      'SELECT COUNT(*)::int AS count FROM notifications WHERE user_id = $1 AND is_read = FALSE',
      [req.user?.userId]
    );

    res.json({ notifications: result.rows, unreadCount: unreadResult.rows[0].count });
  } catch (error) {
    console.error('Failed to fetch notifications:', error);
    res.status(500).json({ message: 'Error fetching notifications' });
  }
});

notificationsRouter.patch('/read-all', authenticateJWT, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    await pool.query(
      'UPDATE notifications SET is_read = TRUE WHERE user_id = $1 AND is_read = FALSE',
      [req.user?.userId]
    );
    res.json({ message: 'Notifications marked as read' });
  } catch (error) {
    console.error('Failed to mark notifications as read:', error);
    res.status(500).json({ message: 'Error updating notifications' });
  }
});

notificationsRouter.patch('/:id/read', authenticateJWT, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const notificationId = Number(req.params.id);
  if (!Number.isInteger(notificationId) || notificationId < 1) {
    res.status(400).json({ message: 'A valid notification id is required' });
    return;
  }

  try {
    const result = await pool.query(
      `UPDATE notifications
       SET is_read = TRUE
       WHERE id = $1 AND user_id = $2
       RETURNING id, message, is_read, created_at`,
      [notificationId, req.user?.userId]
    );
    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Notification not found' });
      return;
    }
    res.json({ notification: result.rows[0] });
  } catch (error) {
    console.error('Failed to mark notification as read:', error);
    res.status(500).json({ message: 'Error updating notification' });
  }
});

export default notificationsRouter;
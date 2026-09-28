import express from 'express';
import {
  createTask,
  getTasks,
  getTaskById,
  getMyTasks,
  updateTask,
  updateTaskStatus,
  deleteTask,
  getAuthorities
} from '../controllers/taskController.js';
import { verifyToken, checkRole } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get all authorities (for admin task assignment dropdown)
router.get(
  '/authorities',
  verifyToken,
  checkRole(['admin']),
  getAuthorities
);

// Get tasks assigned to current authority user
router.get(
  '/my-tasks',
  verifyToken,
  checkRole(['authority']),
  getMyTasks
);

// Get all tasks (admin only)
router.get(
  '/',
  verifyToken,
  checkRole(['admin']),
  getTasks
);

// Get a single task by ID
// V4 Member 1: Restrict task detail access to authorized roles.
// Citizens must not access internal task assignment information.
// Admins can view any task, while authorities are further restricted
// to tasks assigned to them through an ownership check in the controller.
router.get(
  '/:id',
  verifyToken,
  checkRole(['admin', 'authority']),
  getTaskById
);

// Create a new task (admin only)
router.post(
  '/',
  verifyToken,
  checkRole(['admin']),
  createTask
);

// Update task status (admin: any task | authority: own tasks only)
router.put(
  '/:id/status',
  verifyToken,
  checkRole(['admin', 'authority']),
  updateTaskStatus
);

router.patch(
  '/:id/status',
  verifyToken,
  checkRole(['admin', 'authority']),
  updateTaskStatus
);

// Update task fields — title, description, priority, dueDate, assignedTo (admin only)
router.put(
  '/:id',
  verifyToken,
  checkRole(['admin']),
  updateTask
);

// Permanently delete a task (admin only)
router.delete(
  '/:id',
  verifyToken,
  checkRole(['admin']),
  deleteTask
);

export default router;

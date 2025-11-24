import type { Task } from '@/types/task.type';
import type { Comment } from '@/types/comment.type';

const STORAGE_KEY_PREFIX = 'task_last_read';
export const STORAGE_CHANGE_EVENT = 'task_read_status_changed';

/**
 * Generate localStorage key for a specific task and user
 */
function getStorageKey(taskId: string, userId: string): string {
  return `${STORAGE_KEY_PREFIX}_${userId}_${taskId}`;
}

/**
 * Dispatch custom event when task read status changes
 */
function dispatchReadStatusChange(taskId: string, userId: string): void {
  try {
    window.dispatchEvent(
      new CustomEvent(STORAGE_CHANGE_EVENT, {
        detail: { taskId, userId },
      })
    );
  } catch (error) {
    console.error('Failed to dispatch read status change event:', error);
  }
}

/**
 * Mark a task as read by storing current timestamp
 */
export function markTaskAsRead(taskId: string, userId: string): void {
  const key = getStorageKey(taskId, userId);
  const timestamp = new Date().toISOString();
  try {
    localStorage.setItem(key, timestamp);
    // Dispatch event to notify components about the change
    dispatchReadStatusChange(taskId, userId);
  } catch (error) {
    console.error('Failed to mark task as read:', error);
  }
}

/**
 * Get the timestamp when user last read a task
 */
export function getLastReadTime(taskId: string, userId: string): Date | null {
  const key = getStorageKey(taskId, userId);
  try {
    const timestamp = localStorage.getItem(key);
    return timestamp ? new Date(timestamp) : null;
  } catch (error) {
    console.error('Failed to get last read time:', error);
    return null;
  }
}

/**
 * Get count of unread comments for a task
 */
export function getUnreadCount(
  taskId: string,
  userId: string,
  comments: Comment[]
): number {
  if (!comments || comments.length === 0) return 0;

  const lastReadTime = getLastReadTime(taskId, userId);
  
  // If never read, all comments are unread except user's own
  if (!lastReadTime) {
    return comments.filter((c) => c.userId !== userId).length;
  }

  // Count comments created after last read time, excluding user's own
  return comments.filter((comment) => {
    const commentTime = new Date(comment.createdAt);
    return commentTime > lastReadTime && comment.userId !== userId;
  }).length;
}

/**
 * Check if task has unread comments
 */
export function hasUnreadComments(
  taskId: string,
  userId: string,
  comments: Comment[]
): boolean {
  return getUnreadCount(taskId, userId, comments) > 0;
}

/**
 * Get unread count from task's updatedAt timestamp (fallback when comments not loaded)
 * This is less accurate but useful for initial render
 */
export function hasUnreadByTimestamp(
  task: Task,
  userId: string
): boolean {
  if (!task.updatedAt) return false;
  
  const lastReadTime = getLastReadTime(task.id, userId);
  if (!lastReadTime) return false;
  
  const taskUpdateTime = new Date(task.updatedAt);
  return taskUpdateTime > lastReadTime;
}

/**
 * Clear read status for a task (useful for testing or cleanup)
 */
export function clearReadStatus(taskId: string, userId: string): void {
  const key = getStorageKey(taskId, userId);
  try {
    localStorage.removeItem(key);
    // Dispatch event to notify components about the change
    dispatchReadStatusChange(taskId, userId);
  } catch (error) {
    console.error('Failed to clear read status:', error);
  }
}

/**
 * Clear all read statuses (useful for logout or reset)
 */
export function clearAllReadStatuses(): void {
  try {
    const keys = Object.keys(localStorage);
    keys.forEach((key) => {
      if (key.startsWith(STORAGE_KEY_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.error('Failed to clear all read statuses:', error);
  }
}


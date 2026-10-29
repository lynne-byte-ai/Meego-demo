export const STORAGE_KEY = 'meego.tasks.v1';

export function addTask(tasks, title, priority = 'normal') {
  const cleaned = title.trim();
  if (!cleaned || cleaned.length > 120) throw new Error('请输入 1–120 个字符的任务名称');
  if (!['normal', 'high'].includes(priority)) throw new Error('无效的优先级');
  return [{ id: crypto.randomUUID(), title: cleaned, priority, done: false }, ...tasks];
}

export function toggleTask(tasks, id) {
  return tasks.map(task => task.id === id ? { ...task, done: !task.done } : task);
}

export function deleteTask(tasks, id) {
  return tasks.filter(task => task.id !== id);
}

export function filterTasks(tasks, filter) {
  if (filter === 'active') return tasks.filter(task => !task.done);
  if (filter === 'done') return tasks.filter(task => task.done);
  return tasks;
}

export function decodeTasks(raw) {
  const tasks = JSON.parse(raw ?? '[]');
  if (!Array.isArray(tasks)) throw new Error('无效的任务数据');
  const ids = new Set();
  for (const task of tasks) {
    if (!task || typeof task.id !== 'string' || !task.id || ids.has(task.id)
      || typeof task.title !== 'string' || !task.title.trim() || task.title.length > 120
      || typeof task.done !== 'boolean' || !['normal', 'high'].includes(task.priority)) {
      throw new Error('无效的任务数据');
    }
    ids.add(task.id);
  }
  return tasks;
}

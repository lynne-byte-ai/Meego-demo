import { test } from 'node:test';
import assert from 'node:assert/strict';
import { addTask, toggleTask, deleteTask, filterTasks, decodeTasks } from '../public/tasks.js';

test('task lifecycle: create, complete, filter, persist, reopen and delete', () => {
  const first = addTask([], '  完成小项目  ', 'high');
  assert.equal(first[0].title, '完成小项目');
  const tasks = addTask(first, '写使用说明');
  const completed = toggleTask(tasks, first[0].id);
  assert.equal(first[0].done, false, 'updates preserve the original state');
  assert.equal(filterTasks(completed, 'done').length, 1);
  assert.equal(filterTasks(completed, 'active')[0].title, '写使用说明');
  const restored = decodeTasks(JSON.stringify(completed));
  assert.deepEqual(restored, completed);
  assert.equal(toggleTask(restored, first[0].id)[1].done, false);
  assert.equal(deleteTask(restored, first[0].id).length, 1);
});

test('reject invalid input and corrupt storage', () => {
  assert.throws(() => addTask([], '   '));
  assert.throws(() => addTask([], 'x'.repeat(121)));
  assert.throws(() => addTask([], 'valid', 'invalid'));
  for (const value of ['broken', '{}', '[null]', '[{"id":"1"}]']) {
    assert.throws(() => decodeTasks(value));
  }
  const [task] = addTask([], 'demo');
  assert.throws(() => decodeTasks(JSON.stringify([task, task])));
  assert.deepEqual(decodeTasks(null), []);
});

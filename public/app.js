import { STORAGE_KEY, addTask, toggleTask, deleteTask, filterTasks, decodeTasks } from './tasks.js';

const $ = selector => document.querySelector(selector);
let tasks = [];
let filter = 'all';
let storageHealthy = true;

function notify(message) {
  $('#notice').textContent = message;
  $('#notice').hidden = false;
}

try {
  tasks = decodeTasks(localStorage.getItem(STORAGE_KEY));
} catch {
  storageHealthy = false;
  notify('无法读取本地数据。原有数据不会被覆盖；新任务暂存在本次页面中。');
}

function save() {
  if (!storageHealthy) return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch {
    storageHealthy = false;
    notify('浏览器无法保存数据。新改动仅保留在本次页面中，请勿刷新。');
  }
}

function render() {
  const done = tasks.filter(task => task.done).length;
  $('#total-count').textContent = tasks.length;
  $('#active-count').textContent = tasks.length - done;
  $('#done-count').textContent = done;
  $('#progress-text').textContent = `完成进度 ${tasks.length ? Math.round(done / tasks.length * 100) : 0}%`;
  const visible = filterTasks(tasks, filter);
  $('#result-count').textContent = `${visible.length} 项任务`;
  $('#empty-state').hidden = visible.length > 0;
  $('#empty-title').textContent = tasks.length ? '这里暂时没有任务' : '给今天一个小目标';
  $('#empty-description').textContent = tasks.length ? '试试其他筛选，或添加一项新任务。' : '添加第一项任务，让好想法开始发生。';
  $('#task-list').replaceChildren(...visible.map(task => {
    const row = document.createElement('li');
    row.className = `task${task.done ? ' completed' : ''}`;
    const label = document.createElement('label');
    label.className = 'task-label';
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = task.done;
    checkbox.addEventListener('change', () => {
      tasks = toggleTask(tasks, task.id);
      save();
      render();
      const replacement = [...document.querySelectorAll('.task input')].find(input => input.dataset.id === task.id);
      (replacement ?? document.querySelector(`[data-filter="${filter}"]`)).focus();
    });
    checkbox.dataset.id = task.id;
    const title = document.createElement('span');
    title.textContent = task.title;
    label.append(checkbox, title);
    const priority = document.createElement('span');
    priority.className = `priority ${task.priority}`;
    priority.textContent = task.priority === 'high' ? '优先处理' : '普通';
    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'delete-button';
    remove.textContent = '×';
    remove.setAttribute('aria-label', `删除任务：${task.title}`);
    remove.addEventListener('click', () => {
      tasks = deleteTask(tasks, task.id);
      save();
      render();
      $('#task-title').focus();
    });
    row.append(label, priority, remove);
    return row;
  }));
}

$('#task-form').addEventListener('submit', event => {
  event.preventDefault();
  try {
    tasks = addTask(tasks, $('#task-title').value, $('#task-priority').value);
  } catch (error) {
    notify(error.message);
    $('#task-title').focus();
    return;
  }
  if (storageHealthy) $('#notice').hidden = true;
  save();
  $('#task-form').reset();
  selectFilter('all');
  $('#task-title').focus();
});

function selectFilter(value) {
  filter = value;
  for (const button of document.querySelectorAll('[data-filter]')) {
    button.setAttribute('aria-pressed', String(button.dataset.filter === filter));
  }
  render();
}

for (const button of document.querySelectorAll('[data-filter]')) {
  button.addEventListener('click', () => selectFilter(button.dataset.filter));
}
render();

const listContainer = document.querySelector('[data-lists]');
const newListForm = document.querySelector('[data-new-list-form]');
const newListInput = document.querySelector('[data-new-list-input]');
const deleteListBtn = document.querySelector('[data-delete-list-btn]');
const deleteCompleteTaskBtn = document.querySelector('[data-delete-completed-task-btn]');
const listDisplayContainer = document.querySelector('[data-list-display-container]');
const listTitleElement = document.querySelector('[data-list-title]');
const listCountElement = document.querySelector('[data-list-count]');
const tasksContainer = document.querySelector('[data-tasks]');
const taskTemplate = document.getElementById('task-template');
const newTaskForm = document.querySelector('[data-new-task-form]');
const newTaskInput = document.querySelector('[data-new-task-input]');

const LOCAL_STORAGE_LIST_KEY = 'task.lists';
const LOCAL_STORAGE_SELECTED_LIST_ID_KEY = 'task.selectedListId';
let lists = JSON.parse(localStorage.getItem(LOCAL_STORAGE_LIST_KEY)) || [];
let selectedListId = localStorage.getItem(LOCAL_STORAGE_SELECTED_LIST_ID_KEY);

listContainer.addEventListener('click', e => {
  if (e.target.tagName.toLowerCase() === 'li') {
    selectedListId = e.target.dataset.listId;
    saveAndRender();
  }
})

newListForm.addEventListener('submit', e => {
  e.preventDefault();
  const listName = newListInput.value;
  if (listName === '') return;
  const list = createList(listName);
  newListInput.value = null;
  lists.push(list);
  if (lists.length === 1) {
    selectedListId = list.id;
  }
  saveAndRender();
})

tasksContainer.addEventListener('click', e => {
  if (e.target.className === 'todo-list__input') {
    const selectedList = lists.find(list => list.id === selectedListId);
    const selectedTask = selectedList.tasks.find(task => task.id === e.target.id);
    selectedTask.complete = e.target.checked;
    save();
    renderTaskCount(selectedList);
  }
})

newTaskForm.addEventListener('submit', e => {
  e.preventDefault();
  const taskName = newTaskInput.value;
  if (taskName.trim() === '') return;
  const task = createTask(taskName);
  newTaskInput.value = null;
  const selectedList = lists.find(list => list.id === selectedListId);
  selectedList.tasks.push(task);
  saveAndRender();
})

tasksContainer.addEventListener('click', e => {
  const editButton = e.target.closest('.todo-list__edit-btn');
  if (editButton) {
    const parentTaskElement = editButton.parentElement;
    const editForm = parentTaskElement.querySelector('.edit-task__form');
    const editInput = parentTaskElement.querySelector('.edit-task__input');
    const cancelBtn = parentTaskElement.querySelector('.edit-task__cancel-btn');

    // Populate the edit input with the current task name
    const taskLabel = parentTaskElement.querySelector('.todo-list__label');
    const oldTaskName = taskLabel.textContent
    editInput.value = taskLabel.textContent;
    // Show the edit form and hide the task label and edit button
    editForm.style.display = '';
    taskLabel.style.display = 'none';
    editButton.style.display = 'none';

    cancelBtn.addEventListener('click', () => {
      editInput.value = oldTaskName;
    })
  }
})
tasksContainer.addEventListener('submit', e => {
  if (!e.target.matches('.edit-task__form')) return;
  e.preventDefault();
  const editForm = e.target; // '.edit-task__form'
  const parentTaskElement = editForm.parentElement; // '.todo-list__task'
  const editInput = editForm.querySelector('.edit-task__input');

  const taskLabel = parentTaskElement.querySelector('.todo-list__label');
  const checkbox = parentTaskElement.querySelector('.todo-list__input');
  const editButton = parentTaskElement.querySelector('.todo-list__edit-btn');

  // Update the task name
  taskLabel.textContent = editInput.value;

  editForm.style.display = 'none';
  taskLabel.style.display = '';
  editButton.style.display = '';

  const selectedList = lists.find(list => list.id === selectedListId);
  const selectedTask = selectedList.tasks.find(task => task.id === checkbox.id);
  selectedTask.name = editInput.value;

  saveAndRender();
})

function createList(name) {
  return {id: Date.now().toString(), name: name, tasks: []};
}

function createTask(name) {
  return {id: Date.now().toString(), name: name, complete: false};
}

deleteListBtn.addEventListener('click', () => {
  lists = lists.filter(list => list.id !== selectedListId);
  selectedListId = lists.length > 0 ? lists[0].id : null;
  saveAndRender();
})

deleteCompleteTaskBtn.addEventListener('click', () => {
  const selectedList = lists.find(list => list.id === selectedListId);
  selectedList.tasks = selectedList.tasks.filter(task => !task.complete);
  saveAndRender();
})

// Save lists to the local storage
function save() {
  localStorage.setItem(LOCAL_STORAGE_LIST_KEY, JSON.stringify(lists));
  localStorage.setItem(LOCAL_STORAGE_SELECTED_LIST_ID_KEY, selectedListId);
}

// Render new list in the lists container
function render() {
  clearElement(listContainer);
  renderList();

  const selectedList = lists.find(list => list.id === selectedListId);
  if (selectedList) {
    listDisplayContainer.style.display = '';
    listTitleElement.textContent = selectedList.name;
    renderTaskCount(selectedList);
    clearElement(tasksContainer);
    renderTasks(selectedList);
  } else {
    listDisplayContainer.style.display = 'none';
  }
}

function renderTasks(selectedList) {
  selectedList.tasks.forEach(task => {
    const taskElement = document.importNode(taskTemplate.content, true);
    const checkbox = taskElement.querySelector('.todo-list__input');
    checkbox.id = task.id;
    checkbox.checked = task.complete;
    const label = taskElement.querySelector('.todo-list__label');
    label.htmlFor = task.id;
    label.append(task.name);
    tasksContainer.appendChild(taskElement);
  })
}

function renderTaskCount(selectedList) {
  const incompleteTaskCount = selectedList.tasks.filter(task => !task.complete).length;
  const taskString = incompleteTaskCount === 1 ? "task" : "tasks";
  listCountElement.textContent = `${incompleteTaskCount} ${taskString} remaining`;
}

function renderList() {
  lists.forEach(list => {
    const listElement = document.createElement('li');
    listElement.dataset.listId = list.id;
    listElement.classList.add('all-tasks__item');
    listElement.textContent = list.name;
    if (list.id === selectedListId) {
      listElement.classList.add('all-tasks__list-item_active');
    }
    listContainer.appendChild(listElement);
  })
}

function saveAndRender() {
  save();
  render();
}

function clearElement(element) {
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
}

render();

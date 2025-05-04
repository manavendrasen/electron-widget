const Store = require('electron-store');
const { ipcRenderer } = require('electron');
const store = new Store();

// Initialize workspaces if none exist
if (!store.has('workspaces')) {
    store.set('workspaces', [{
        id: 1,
        name: 'Workspace 1',
        tasks: []
    }]);
    store.set('currentWorkspaceId', 1);
}

// DOM Elements
const currentWorkspaceSpan = document.getElementById('current-workspace');
const prevWorkspaceBtn = document.getElementById('prev-workspace');
const nextWorkspaceBtn = document.getElementById('next-workspace');
const addWorkspaceBtn = document.getElementById('add-workspace');
const newTaskInput = document.getElementById('new-task');
const addTaskBtn = document.getElementById('add-task');
const tasksContainer = document.getElementById('tasks');
const minimizeBtn = document.getElementById('minimize');
const closeBtn = document.getElementById('close');

// Handle FAB and task input overlay
const fab = document.getElementById('add-task-fab');
const taskInputOverlay = document.getElementById('task-input-overlay');
const taskInput = document.getElementById('new-task');
const addTaskButton = document.getElementById('add-task');

// Window Controls
minimizeBtn.addEventListener('click', () => {
    ipcRenderer.send('minimize-window');
});

closeBtn.addEventListener('click', () => {
    ipcRenderer.send('close-window');
});

// Workspace Management
function getWorkspaces() {
    return store.get('workspaces');
}

function getCurrentWorkspaceId() {
    return store.get('currentWorkspaceId');
}

function setCurrentWorkspaceId(id) {
    store.set('currentWorkspaceId', id);
    updateUI();
}

function addWorkspace() {
    const workspaces = getWorkspaces();
    const newId = workspaces.length > 0 ? Math.max(...workspaces.map(w => w.id)) + 1 : 1;
    workspaces.push({
        id: newId,
        name: `Workspace ${newId}`,
        tasks: []
    });
    store.set('workspaces', workspaces);
    setCurrentWorkspaceId(newId);
}

function getCurrentWorkspace() {
    const workspaces = getWorkspaces();
    const currentId = getCurrentWorkspaceId();
    return workspaces.find(w => w.id === currentId);
}

function updateWorkspaceUI() {
    const workspace = getCurrentWorkspace();
    currentWorkspaceSpan.textContent = workspace.name;
}

// Task Management
function addTask(content) {
    if (!content.trim()) return;
    
    const workspace = getCurrentWorkspace();
    const newTask = {
        id: Date.now(),
        content: content.trim(),
        completed: false
    };
    workspace.tasks.push(newTask);
    saveWorkspace(workspace);
    updateUI();
    taskInput.focus();
}

function toggleTask(taskId) {
    const workspace = getCurrentWorkspace();
    const task = workspace.tasks.find(t => t.id === taskId);
    if (task) {
        task.completed = !task.completed;
        saveWorkspace(workspace);
        updateUI();
    }
}

function deleteTask(taskId) {
    const workspace = getCurrentWorkspace();
    workspace.tasks = workspace.tasks.filter(t => t.id !== taskId);
    saveWorkspace(workspace);
    updateUI();
}

function editTask(taskId, newContent) {
    const workspace = getCurrentWorkspace();
    const task = workspace.tasks.find(t => t.id === taskId);
    if (task) {
        task.content = newContent;
        saveWorkspace(workspace);
        updateUI();
    }
}

function editWorkspaceName(newName) {
    // Only allow emojis
    const emojiRegex = /^[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1F1E6}-\u{1F1FF}\u{1F191}-\u{1F251}\u{1F004}\u{1F0CF}\u{1F170}-\u{1F171}\u{1F17E}-\u{1F17F}\u{1F18E}\u{3030}\u{2B50}\u{2B55}\u{2934}-\u{2935}\u{2B05}-\u{2B07}\u{2B1B}-\u{2B1C}\u{3297}\u{3299}\u{303D}\u{00A9}\u{00AE}\u{2122}\u{23F3}\u{24C2}\u{23E9}-\u{23EC}\u{25B6}\u{23F8}-\u{23FA}\u{200D}\u{2640}-\u{2642}\u{2695}-\u{2696}\u{2708}\u{FE0F}\u{1F3FB}-\u{1F3FF}]+$/u;
    
    if (!emojiRegex.test(newName)) {
        alert("Please use only emojis for workspace names");
        return;
    }

    const workspace = getCurrentWorkspace();
    if (workspace) {
        workspace.name = newName;
        saveWorkspace(workspace);
        updateUI();
    }
}

function saveWorkspace(workspace) {
    const workspaces = getWorkspaces();
    const index = workspaces.findIndex(w => w.id === workspace.id);
    if (index !== -1) {
        workspaces[index] = workspace;
        store.set('workspaces', workspaces);
    }
}

// Drag and Drop
let draggedTask = null;

function handleDragStart(e) {
    draggedTask = e.target.closest('.task');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', draggedTask.dataset.id);
    setTimeout(() => {
        draggedTask.style.opacity = '0.5';
    }, 0);
}

function handleDragEnd(e) {
    draggedTask.style.opacity = '1';
    draggedTask = null;
}

function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
}

function handleDrop(e) {
    e.preventDefault();
    const targetTask = e.target.closest('.task');
    if (!targetTask || !draggedTask) return;

    const workspace = getCurrentWorkspace();
    const draggedId = parseInt(draggedTask.dataset.id);
    const targetId = parseInt(targetTask.dataset.id);

    const draggedIndex = workspace.tasks.findIndex(t => t.id === draggedId);
    const targetIndex = workspace.tasks.findIndex(t => t.id === targetId);

    if (draggedIndex !== -1 && targetIndex !== -1) {
        const [task] = workspace.tasks.splice(draggedIndex, 1);
        workspace.tasks.splice(targetIndex, 0, task);
        saveWorkspace(workspace);
        updateUI();
    }
}

// UI Updates
function updateUI() {
    updateWorkspaceUI();
    renderTasks();
}

function renderTasks() {
    const workspace = getCurrentWorkspace();
    tasksContainer.innerHTML = '';
    
    workspace.tasks.forEach(task => {
        const taskElement = document.createElement('div');
        taskElement.className = `task ${task.completed ? 'completed' : ''}`;
        taskElement.dataset.id = task.id;
        taskElement.draggable = true;
        taskElement.innerHTML = `
            <div class="task-content" contenteditable="true" onblur="editTask(${task.id}, this.textContent)">${task.content}</div>
            <div class="task-actions">
                <button class="toggle" onclick="toggleTask(${task.id})"><i class="fas fa-check"></i></button>
                <button class="delete" onclick="deleteTask(${task.id})"><i class="fas fa-trash"></i></button>
            </div>
        `;
        tasksContainer.appendChild(taskElement);
    });

    // Add drag and drop event listeners
    const tasks = tasksContainer.querySelectorAll('.task');
    tasks.forEach(task => {
        task.addEventListener('dragstart', handleDragStart);
        task.addEventListener('dragend', handleDragEnd);
        task.addEventListener('dragover', handleDragOver);
        task.addEventListener('drop', handleDrop);
    });
}

// Event Listeners
addWorkspaceBtn.addEventListener('click', addWorkspace);

prevWorkspaceBtn.addEventListener('click', () => {
    const workspaces = getWorkspaces();
    const currentId = getCurrentWorkspaceId();
    const currentIndex = workspaces.findIndex(w => w.id === currentId);
    if (currentIndex > 0) {
        setCurrentWorkspaceId(workspaces[currentIndex - 1].id);
    }
});

nextWorkspaceBtn.addEventListener('click', () => {
    const workspaces = getWorkspaces();
    const currentId = getCurrentWorkspaceId();
    const currentIndex = workspaces.findIndex(w => w.id === currentId);
    if (currentIndex < workspaces.length - 1) {
        setCurrentWorkspaceId(workspaces[currentIndex + 1].id);
    }
});

addTaskBtn.addEventListener('click', () => {
    const taskText = taskInput.value;
    if (taskText) {
        addTask(taskText);
        taskInput.value = '';
    }
});

taskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const taskText = taskInput.value;
        if (taskText) {
            addTask(taskText);
            taskInput.value = '';
        }
    }
});

// Workspace name editing
currentWorkspaceSpan.addEventListener('dblclick', () => {
    currentWorkspaceSpan.contentEditable = true;
    currentWorkspaceSpan.focus();
});

currentWorkspaceSpan.addEventListener('blur', () => {
    currentWorkspaceSpan.contentEditable = false;
    editWorkspaceName(currentWorkspaceSpan.textContent);
});

// Handle FAB and task input overlay
fab.addEventListener('click', () => {
    taskInputOverlay.style.display = 'flex';
    taskInput.focus();
});

taskInputOverlay.addEventListener('click', (e) => {
    if (e.target === taskInputOverlay) {
        taskInputOverlay.style.display = 'none';
        taskInput.value = '';
    }
});

addTaskButton.addEventListener('click', () => {
    const taskText = taskInput.value;
    if (taskText) {
        addTask(taskText);
        taskInput.value = '';
    }
});

taskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const taskText = taskInput.value;
        if (taskText) {
            addTask(taskText);
            taskInput.value = '';
        }
    }
});

// Workspace Management
function deleteWorkspace(workspaceId) {
    const workspaces = getWorkspaces();
    if (workspaces.length <= 1) {
        alert("Cannot delete the last workspace");
        return;
    }
    
    const filteredWorkspaces = workspaces.filter(w => w.id !== workspaceId);
    store.set('workspaces', filteredWorkspaces);
    
    // If we're deleting the current workspace, switch to the first available one
    if (getCurrentWorkspaceId() === workspaceId) {
        setCurrentWorkspaceId(filteredWorkspaces[0].id);
    }
    
    updateUI();
}

// Add delete workspace button event listener
const deleteWorkspaceBtn = document.getElementById('delete-workspace');
deleteWorkspaceBtn.addEventListener('click', () => {
    const currentWorkspace = getCurrentWorkspace();
    if (currentWorkspace) {
        deleteWorkspace(currentWorkspace.id);
    }
});

// Add function to delete all data
function deleteAllData() {
    if (confirm("Are you sure you want to delete all data? This cannot be undone.")) {
        store.clear();
        // Reset to initial state
        store.set('workspaces', [{
            id: 1,
            name: '📝',
            tasks: []
        }]);
        store.set('currentWorkspaceId', 1);
        updateUI();
    }
}

// Add delete all data button event listener
const deleteAllDataBtn = document.getElementById('delete-all-data');
deleteAllDataBtn.addEventListener('click', deleteAllData);

// Focus handling
document.addEventListener('focusin', () => {
    document.querySelector('.app-container').classList.add('focused');
});

document.addEventListener('focusout', (e) => {
    // Only remove focus if the new focus is outside the app
    if (!e.relatedTarget || !e.relatedTarget.closest('.app-container')) {
        document.querySelector('.app-container').classList.remove('focused');
    }
});

// Initialize UI
updateUI(); 
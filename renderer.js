const Store = require('electron-store');
const { ipcRenderer } = require('electron');
const store = new Store();
// store.clear();

// Initialize workspaces if none exist
if (!store.has('workspaces')) {
	store.set('workspaces', [
		{
			id: 1,
			name: '1',
			tasks: []
		},
		{
			id: 2,
			name: '2',
			tasks: []
		},
		{
			id: 3,
			name: '3',
			tasks: []
		}
	]);
    store.set('currentWorkspaceId', 1);
}

// DOM Elements
const currentWorkspaceSpan = document.getElementById('current-workspace');
const prevWorkspaceBtn = document.getElementById('prev-workspace');
const nextWorkspaceBtn = document.getElementById('next-workspace');
const addTaskBtn = document.getElementById('add-task');
const tasksContainer = document.getElementById('tasks');
const minimizeBtn = document.getElementById('minimize');
const closeBtn = document.getElementById('close');
const taskInput = document.getElementById('new-task');


// // Handle FAB and task input overlay
// const fab = document.getElementById('add-task-fab');
// const taskInputOverlay = document.getElementById('task-input-overlay');

// const addTaskButton = document.getElementById('add-task');

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

// function addWorkspace() {
// 	alert("Maximum of 3 workspaces reached");
// }

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

// function editWorkspaceName(newName) {
//     const workspace = getCurrentWorkspace();
//     if (workspace) {
//         workspace.name = newName;
//         saveWorkspace(workspace);
//         updateUI();
//     }
// }

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

// // Event Listeners
// addWorkspaceBtn.addEventListener('click', addWorkspace);

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
    }	else {
			alert("No Task Added")
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

// // Workspace name editing
// currentWorkspaceSpan.addEventListener('dblclick', () => {
//     currentWorkspaceSpan.contentEditable = true;
//     currentWorkspaceSpan.focus();
// });

// currentWorkspaceSpan.addEventListener('blur', () => {
//     currentWorkspaceSpan.contentEditable = false;
//     editWorkspaceName(currentWorkspaceSpan.textContent);
// });



// addTaskButton.addEventListener('click', () => {
//     const taskText = taskInput.value;
//     if (taskText) {
//         addTask(taskText);
//         taskInput.value = '';
//     }
// });

taskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const taskText = taskInput.value;
        if (taskText) {
            addTask(taskText);
            taskInput.value = '';
        }
    }
});

// // Workspace Management
// function deleteWorkspace(workspaceId) {
//     const workspaces = getWorkspaces();
//     if (workspaces.length <= 1) {
//         alert("Cannot delete the last workspace");
//         return;
//     }
    
//     const filteredWorkspaces = workspaces.filter(w => w.id !== workspaceId);
//     store.set('workspaces', filteredWorkspaces);
    
//     // If we're deleting the current workspace, switch to the first available one
//     if (getCurrentWorkspaceId() === workspaceId) {
//         setCurrentWorkspaceId(filteredWorkspaces[0].id);
//     }
    
//     updateUI();
// }

// // Add delete workspace button event listener
// const deleteWorkspaceBtn = document.getElementById('delete-workspace');
// deleteWorkspaceBtn.addEventListener('click', () => {
//     const currentWorkspace = getCurrentWorkspace();
//     if (currentWorkspace) {
//         deleteWorkspace(currentWorkspace.id);
//     }
// });

// // Add function to delete all data
// function deleteAllData() {
//     if (confirm("Are you sure you want to delete all data? This cannot be undone.")) {
//         store.clear();
//         // Reset to initial state
//         store.set('workspaces', [{
//             id: 1,
//             name: '📝',
//             tasks: []
//         }]);
//         store.set('currentWorkspaceId', 1);
//         updateUI();
//     }
// }

// // Add delete all data button event listener
// const deleteAllDataBtn = document.getElementById('delete-all-data');
// deleteAllDataBtn.addEventListener('click', deleteAllData);

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
// script.js

// Base URL for your Node.js API
// IMPORTANT: If your API is running on a different port or host (e.g., your AWS EC2 instance),
// YOU MUST UPDATE THIS URL.
// For local development, it's typically http://localhost:3000
const API_BASE_URL = 'http://localhost:3000';

// Get DOM elements
const messageBox = document.getElementById('messageBox');
const apiStatusIndicator = document.getElementById('apiStatusIndicator');
const apiStatusText = document.getElementById('apiStatusText');
const newTodoInput = document.getElementById('newTodoInput');
const addTodoBtn = document.getElementById('addTodoBtn');
const todoList = document.getElementById('todoList');

/**
 * Updates the visual API connection status.
 * @param {boolean} isConnected - True if connected, false otherwise.
 */
function updateApiStatus(isConnected) {
    if (isConnected) {
        apiStatusIndicator.classList.remove('disconnected');
        apiStatusIndicator.classList.add('connected');
        apiStatusText.textContent = 'API: Connected';
    } else {
        apiStatusIndicator.classList.remove('connected');
        apiStatusIndicator.classList.add('disconnected');
        apiStatusText.textContent = 'API: Disconnected';
    }
}

/**
 * Displays a message in the message box.
 * @param {string} message - The message to display.
 * @param {string} type - 'success', 'error', or 'info' for styling.
 */
function showMessage(message, type = 'info') {
    messageBox.textContent = message;
    messageBox.className = 'message-box'; // Reset classes
    if (type === 'success') {
        messageBox.classList.add('bg-green-100', 'text-green-800', 'border-green-400');
    } else if (type === 'error') {
        messageBox.classList.add('bg-red-100', 'text-red-800', 'border-red-400');
    } else { // info or default
        messageBox.classList.add('bg-blue-100', 'text-blue-800', 'border-blue-400');
    }
    messageBox.style.display = 'block';
    setTimeout(() => {
        messageBox.style.display = 'none';
    }, 3000); // Hide after 3 seconds
}

/**
 * Fetches all todos from the API and renders them.
 */
async function fetchTodos() {
    try {
        const response = await fetch(`${API_BASE_URL}/todos`);
        if (!response.ok) {
            updateApiStatus(true); // API is reachable but returned an error status
            const errorData = await response.json();
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }
        const todos = await response.json();
        renderTodos(todos);
        updateApiStatus(true); // API is reachable and responded successfully
    } catch (error) {
        console.error('Error fetching todos:', error);
        updateApiStatus(false); // API is not reachable or network error
        showMessage(`Failed to connect to API or fetch todos: ${error.message}. Please ensure your Node.js API is running and CORS is enabled.`, 'error');
    }
}

/**
 * Renders the list of todos in the HTML.
 * @param {Array} todos - An array of todo objects.
 */
function renderTodos(todos) {
    todoList.innerHTML = ''; // Clear existing list

    if (todos.length === 0) {
        todoList.innerHTML = '<li class="text-center text-gray-500 py-4">No todos yet! Add one above.</li>';
        return;
    }

    todos.forEach(todo => {
        const listItem = document.createElement('li');
        listItem.className = 'todo-item';
        listItem.setAttribute('data-id', todo._id); // Use _id from MongoDB

        listItem.innerHTML = `
            <span class="title ${todo.completed ? 'completed' : ''}">${todo.title}</span>
            <div class="actions">
                <button class="toggle-btn" data-id="${todo._id}" data-completed="${todo.completed}">
                    ${todo.completed ? 'Unmark' : 'Complete'}
                </button>
                <button class="delete-btn" data-id="${todo._id}">
                    Delete
                </button>
            </div>
        `;
        todoList.appendChild(listItem);
    });

    // Add event listeners to the dynamically created buttons
    document.querySelectorAll('.toggle-btn').forEach(button => {
        button.addEventListener('click', (event) => {
            const id = event.target.dataset.id;
            const completed = event.target.dataset.completed === 'true'; // Convert string to boolean
            toggleTodoStatus(id, completed);
        });
    });

    document.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', (event) => {
            const id = event.target.dataset.id;
            deleteTodo(id);
        });
    });
}

/**
 * Adds a new todo item.
 */
async function addTodo() {
    const title = newTodoInput.value.trim();

    if (!title) {
        showMessage('Todo title cannot be empty!', 'error');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/todos`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ title }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        newTodoInput.value = ''; // Clear input
        showMessage('Todo added successfully!', 'success');
        fetchTodos(); // Refresh the list
    } catch (error) {
        console.error('Error adding todo:', error);
        showMessage(`Failed to add todo: ${error.message}`, 'error');
    }
}

/**
 * Toggles the completion status of a todo item.
 * @param {string} id - The ID of the todo to update.
 * @param {boolean} currentStatus - The current completion status.
 */
async function toggleTodoStatus(id, currentStatus) {
    try {
        const response = await fetch(`${API_BASE_URL}/todos/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ completed: !currentStatus }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        showMessage('Todo status updated!', 'success');
        fetchTodos(); // Refresh the list
    } catch (error) {
        console.error('Error toggling todo status:', error);
        showMessage(`Failed to update status: ${error.message}`, 'error');
    }
}

/**
 * Deletes a todo item.
 * @param {string} id - The ID of the todo to delete.
 */
async function deleteTodo(id) {
    // IMPORTANT: Avoid using window.confirm() in production applications, use a custom modal UI instead.
    if (!confirm('Are you sure you want to delete this todo?')) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/todos/${id}`, {
            method: 'DELETE',
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        showMessage('Todo deleted successfully!', 'success');
        fetchTodos(); // Refresh the list
    } catch (error) {
        console.error('Error deleting todo:', error);
        showMessage(`Failed to delete todo: ${error.message}`, 'error');
    }
}

// --- Event Listeners ---
// Add event listener for the 'Add Todo' button
addTodoBtn.addEventListener('click', addTodo);

// Add event listener for pressing 'Enter' in the input field
newTodoInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        addTodo();
    }
});

// Fetch todos when the page loads
window.onload = fetchTodos;

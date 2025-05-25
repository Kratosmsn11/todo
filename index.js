// index.js

// Import the Express.js framework
const express = require('express');
// Import the 'uuid' library to generate unique IDs for todos
const { v4: uuidv4 } = require('uuid');

// Initialize the Express application
const app = express();
// Define the port the server will listen on
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON bodies from incoming requests
// This allows the server to read JSON data sent in POST and PUT requests
app.use(express.json());

// In-memory array to store todo items.
// Each todo item will be an object with 'id', 'title', and 'completed' properties.
let todos = [
    { id: uuidv4(), title: 'Learn Node.js', completed: false },
    { id: uuidv4(), title: 'Build a REST API', completed: true },
    { id: uuidv4(), title: 'Deploy to cloud', completed: false },
];

// --- API Endpoints ---

/**
 * GET /todos
 * Retrieves all todo items.
 */
app.get('/todos', (req, res) => {
    // Send the entire todos array as a JSON response
    res.status(200).json(todos);
});

/**
 * POST /todos
 * Creates a new todo item.
 * Request body should contain: { "title": "New Todo Title" }
 */
app.post('/todos', (req, res) => {
    // Extract the 'title' from the request body
    const { title } = req.body;

    // Check if a title is provided
    if (!title) {
        // If no title, send a 400 Bad Request error
        return res.status(400).json({ message: 'Title is required to create a todo.' });
    }

    // Create a new todo object with a unique ID, the provided title, and default completed status
    const newTodo = {
        id: uuidv4(),      // Generate a unique ID for the new todo
        title,             // Assign the title from the request body
        completed: false   // New todos are initially not completed
    };

    // Add the new todo to the in-memory array
    todos.push(newTodo);

    // Send a 201 Created status code and the newly created todo object as a JSON response
    res.status(201).json(newTodo);
});

/**
 * GET /todos/:id
 * Retrieves a single todo item by its ID.
 */
app.get('/todos/:id', (req, res) => {
    // Extract the todo ID from the request parameters
    const { id } = req.params;

    // Find the todo item in the array that matches the provided ID
    const todo = todos.find(t => t.id === id);

    // Check if the todo was found
    if (!todo) {
        // If not found, send a 404 Not Found error
        return res.status(404).json({ message: 'Todo not found.' });
    }

    // If found, send the todo object as a JSON response
    res.status(200).json(todo);
});

/**
 * PUT /todos/:id
 * Updates an existing todo item by its ID.
 * Request body can contain: { "title": "Updated Title", "completed": true }
 */
app.put('/todos/:id', (req, res) => {
    // Extract the todo ID from the request parameters
    const { id } = req.params;
    // Extract 'title' and 'completed' from the request body
    const { title, completed } = req.body;

    // Find the index of the todo item in the array that matches the provided ID
    const todoIndex = todos.findIndex(t => t.id === id);

    // Check if the todo was found
    if (todoIndex === -1) {
        // If not found, send a 404 Not Found error
        return res.status(404).json({ message: 'Todo not found.' });
    }

    // Get the existing todo item
    const existingTodo = todos[todoIndex];

    // Create an updated todo object by merging existing data with new data from the request body
    const updatedTodo = {
        ...existingTodo, // Spread existing properties
        // Update title if provided, otherwise keep the existing title
        title: title !== undefined ? title : existingTodo.title,
        // Update completed status if provided, otherwise keep the existing status
        completed: completed !== undefined ? completed : existingTodo.completed
    };

    // Replace the old todo item with the updated one in the array
    todos[todoIndex] = updatedTodo;

    // Send the updated todo object as a JSON response
    res.status(200).json(updatedTodo);
});

/**
 * DELETE /todos/:id
 * Deletes a single todo item by its ID.
 */
app.delete('/todos/:id', (req, res) => {
    // Extract the todo ID from the request parameters
    const { id } = req.params;

    // Find the index of the todo item in the array that matches the provided ID
    const initialLength = todos.length;
    // Filter out the todo item with the matching ID, effectively deleting it
    todos = todos.filter(t => t.id !== id);

    // Check if a todo was actually removed (i.e., if the length changed)
    if (todos.length === initialLength) {
        // If no todo was removed, it means the ID was not found
        return res.status(404).json({ message: 'Todo not found.' });
    }

    // If successfully deleted, send a 204 No Content status code
    // A 204 response indicates that the server successfully processed the request
    // and is not returning any content.
    res.status(204).send();
});

// Start the server and listen for incoming requests on the specified port
app.listen(PORT, () => {
    console.log(`Todo API service running on http://localhost:${PORT}`);
});

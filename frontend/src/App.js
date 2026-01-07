import React, { useState, useEffect } from 'react';
import './App.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function App() {
  const [todos, setTodos] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch all todos on component mount
  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/todos`);
      if (!response.ok) {
        throw new Error('Failed to fetch todos');
      }
      const data = await response.json();
      setTodos(data);
      setError('');
    } catch (err) {
      setError('Failed to load todos. Please try again.');
      console.error('Error fetching todos:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!newTask.trim()) {
      setError('Please enter a task');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/todos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ task: newTask }),
      });

      if (!response.ok) {
        throw new Error('Failed to add todo');
      }

      const addedTodo = await response.json();
      setTodos([addedTodo, ...todos]);
      setNewTask('');
      setError('');
    } catch (err) {
      setError('Failed to add todo. Please try again.');
      console.error('Error adding todo:', err);
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`${API_URL}/todos/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete todo');
      }

      setTodos(todos.filter(todo => todo.id !== id));
    } catch (err) {
      setError('Failed to delete todo. Please try again.');
      console.error('Error deleting todo:', err);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <div className="app">
      <div className="container">
        <h1>To-Do List</h1>

        {error && <div className="error">{error}</div>}

        <form onSubmit={handleSubmit} className="todo-form">
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="Enter a new task..."
            className="todo-input"
          />
          <button type="submit" className="submit-btn">
            Add Task
          </button>
        </form>

        {loading ? (
          <p className="loading">Loading todos...</p>
        ) : (
          <table className="todo-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Task</th>
                <th>Created At</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {todos.length === 0 ? (
                <tr>
                  <td colSpan="4" className="no-todos">
                    No todos yet. Add one above!
                  </td>
                </tr>
              ) : (
                todos.map((todo) => (
                  <tr key={todo.id}>
                    <td>{todo.id}</td>
                    <td>{todo.task}</td>
                    <td>{formatDate(todo.created_at)}</td>
                    <td>
                      <button
                        onClick={() => handleDelete(todo.id)}
                        className="delete-btn"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default App;

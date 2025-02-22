import React, { useState, useEffect } from 'react';
import AddTodo from './components/AddTodo'; // Import the AddTodo component
import ToDoList from './components/ToDoList';
import axios from 'axios';
import './App.css';



const API_BASE_URL = 'http://localhost:4000/api';

console.log('API URL:', API_BASE_URL);

function App() {
  const [todos, setTodos] = useState([]);

  useEffect(() => {
    // Test the API connection
    axios.get(`${API_BASE_URL}/mytodos`)
      .then(() => console.log('Successfully connected to API'))
      .catch(err => console.error('API connection error:', err));
    
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      console.log('Fetching todos...');
      const response = await axios.get(`${API_BASE_URL}/mytodos`);
      console.log('Fetched todos:', response.data);
      setTodos(response.data);
    } catch (error) {
      console.error('Error fetching todos:', error.response?.data || error.message);
    }
  };

  const addTodo = async (todoData) => {
    try {
        console.log('Sending todo data:', todoData);
        
        if (!todoData.text) {
            throw new Error('Todo text is required');
        }
        
        const response = await axios.post(`${API_BASE_URL}/mytodos`, todoData, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        console.log('Server response:', response.data);
        setTodos([...todos, response.data]);
    } catch (error) {
        console.error('Error adding todo:', error.response?.data || error.message);
        alert(error.response?.data?.error || error.message || 'Error adding todo. Please try again.');
    }
  };

  const onCheck = async (id, completed) => {
    try {
        const response = await axios.put(`${API_BASE_URL}/mytodos/${id}`, { 
            completed: !completed 
        });
        console.log('Toggle response:', response.data);
        setTodos(todos.map(todo =>
            todo.id === id ? { ...todo, completed: !todo.completed } : todo
        ));
    } catch (error) {
        console.error('Error toggling todo:', error.response?.data || error);
        alert('Error updating todo status. Please try again.');
    }
  };

  const deleteTodo = async (id) => {
    try {
      console.log('Deleting todo with ID:', id);
      await axios.delete(`${API_BASE_URL}/mytodos/${id}`);
      setTodos(todos.filter(todo => todo.id !== id));
    } catch (error) {
      console.error('Error deleting todo:', error);
    }
  };

  const editTodo = async (id, newText) => {
    try {
      await axios.put(`${API_BASE_URL}/mytodos/${id}`, { text: newText });
      setTodos(todos.map(todo =>
        todo.id === id ? { ...todo, text: newText } : todo
      ));
    } catch (error) {
      console.error('Error editing todo:', error);
    }
  };

  return (
    <div className="App">
      {console.log('Rendering App component')}
      <h1>Todo App</h1>
      <AddTodo onAdd={addTodo} />
      <ToDoList
        todos={todos}
        onCheck={onCheck}
        onDelete={deleteTodo}
        onEdit={editTodo}
      />
    </div>
  );
}

export default App;

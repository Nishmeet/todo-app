import React from 'react';
import TodoItem from './TodoItem';

function ToDoList({ todos, onCheck, onDelete, onEdit }) {

    const completed=todos.filter(todo=>todo.completed).length;
    const uncompleted=todos.filter(todo=>!todo.completed).length;
    if (!todos.length) {
        return <p className="empty-message">No todos yet. Add one above!</p>;
    }

    return (
        <>
      
        <div className="todo-list">
            {todos.map(todo => (
                <TodoItem
                    key={todo.id}
                    todo={todo}
                    onCheck={onCheck}
                    onDelete={onDelete}
                    onEdit={onEdit}
                />
            ))}
        </div>
        <div className="stats">
            <p>Completed: {completed} | Uncompleted: {uncompleted}</p>
            
        </div>
        </>
    );
}

export default ToDoList;
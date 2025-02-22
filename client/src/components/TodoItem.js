import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faPenToSquare, 
    faFloppyDisk, 
    faTrashCan, 
    faSquare,
    faSquareCheck 
} from '@fortawesome/free-regular-svg-icons';

function TodoItem({ todo, onCheck, onDelete, onEdit }) {
    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState(todo.text);

    const handleEdit = () => {
        console.log('I am in Editing todo:', todo.id, editText);
        console.log('isEditing:', isEditing);
        if (isEditing) {
            onEdit(todo.id, editText);
        }
        setIsEditing(!isEditing);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleEdit();
        }
    };

    return (
        <div className={`todo-item ${todo.completed ? 'completed' : ''} ${isEditing ? 'editing' : ''}`}>
            <div className="todo-checkbox">
                <FontAwesomeIcon 
                    icon={todo.completed ? faSquareCheck : faSquare}
                    className={`checkbox-icon ${todo.completed ? 'checked' : ''}`}
                    onClick={() => onCheck(todo.id, todo.completed)}
                />
            </div>
            <div className="todo-content">
                {isEditing ? (
                    <input
                        type="text"
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        onKeyDown={handleKeyPress}
                        className="edit-input"
                        autoFocus
                    />
                ) : (
                    <span className="todo-text">{todo.text}</span>
                )}
            </div>
            <div className="todo-actions">
                <button 
                    className="icon-btn"
                    onClick={handleEdit}
                    title={isEditing ? 'Save' : 'Edit'}
                >
                    <FontAwesomeIcon icon={isEditing ? faFloppyDisk : faPenToSquare} />
                </button>
                <button 
                    className="icon-btn"
                    onClick={() => onDelete(todo.id)}
                    title="Delete"
                >
                    <FontAwesomeIcon icon={faTrashCan} />
                </button>
            </div>
          
        </div>
    );
}

export default TodoItem;
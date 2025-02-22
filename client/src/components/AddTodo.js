import React, {useState} from 'react';

function AddTodo({onAdd}){
    const [text, setText] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (text.trim()) {
            await onAdd({ text: text.trim() }); // Send text directly as an object
            setText('');
        }
    };

    return (
        <form className="add-todo-form" onSubmit={handleSubmit}>
            <div>
                <input 
                    type="text" 
                    value={text}
                    onChange={(e) => setText(e.target.value)} 
                    placeholder='Enter a new task..' 
                    className='todo-input'
                />
                <button type="submit" className='add-btn'>ADD</button>
            </div>
        </form>
    );
}

export default AddTodo;


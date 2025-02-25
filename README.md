# Todo App

A full-stack Todo application built with React and Node.js, featuring a PostgreSQL database.

## Features

- Create, Read, Update, and Delete todos
- Mark todos as complete/incomplete
- Edit todo text
- Real-time todo count statistics
- Responsive design with modern UI
- Dark mode interface

## Tech Stack

### Frontend

- React.js
- Axios for API calls
- Font Awesome icons
- CSS for styling

### Backend

- Node.js
- Express.js
- PostgreSQL (via Supabase)
- CORS for cross-origin requests

## Project Structure

odo-app
├── /client # React frontend
│ ├── /src
│ │ ├── /components # React components
│ │ ├── App.js # Main React component
│ │ ├── App.css # Styles
│ │ └── config.js # API configuration
│ └── package.json # Frontend dependencies
└── /server # Node.js backend
├── index.js # Express server
└── package.json # Backend dependencies

## Installation

1. Clone the repository

git clone https://github.com/yourusername/todo-app.git

```

2. Install dependencies


npm install
```

3. Start the server

npm run dev

```


**Setup Frontend**


cd client
npm install
npm start
```

## API Endpoints

- `GET /api/mytodos` - Get all todos
- `POST /api/mytodos` - Create a new todo
- `PUT /api/mytodos/:id` - Update a todo
- `DELETE /api/mytodos/:id` - Delete a todo

## Environment Variables

### Backend (.env)

DATABASE_URL=your_postgresql_connection_string
PORT=4000
)

### Frontend (.env)

REACT_APP_API_URL=your_backend_url

## Deployment

- Backend: Deployed on Render
- Database: Supabase PostgreSQL
- Frontend: To be deployed

Task Board - Frontend
This is the Next.js frontend for the Task Board application. It provides a clean, responsive user interface for interacting with the backend API to manage tasks. It is built with TypeScript and styled using Tailwind CSS and the shadcn/ui component library.

Features
View a list of all tasks.

Add new tasks via a form.

Mark tasks as complete or incomplete with a checkbox.

Delete tasks with a professional confirmation dialog.

A modern and clean UI built with shadcn/ui.

Responsive design for both mobile and desktop.

Prerequisites
Node.js (v18 or later is recommended)

npm or yarn

Setup and Installation
Clone the repository (or download the project files).

Navigate to the frontend directory:

cd frontend

Install all required dependencies:

npm install

Initialize shadcn/ui (if not already done):
If this is a fresh setup, you may need to initialize the UI components.

npx shadcn-ui@latest init
npx shadcn-ui@latest add button input textarea card checkbox alert-dialog

Important: Make sure the backend server is running on http://localhost:3000 before starting the frontend.

Running the Application
To start the frontend development server, run the following command:

npm run dev

The application will be available at http://localhost:3001.

Configuration
The frontend is configured to connect to the backend API at http://localhost:3000. This is set in the API_BASE_URL constant inside the src/app/page.tsx file. If your backend is running on a different address or port, you will need to update this value.
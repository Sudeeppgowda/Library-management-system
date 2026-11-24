# BookNest – Library Management System (Local Storage)

A beginner-friendly library project made with HTML, CSS and JavaScript. All app data is stored in the browser's Local Storage. No Node.js, Express or MySQL setup is required.

## Features
- Student registration and login
- Admin login
- Search and browse books
- Admin can add and delete books
- Students can borrow available books
- Borrowing records and 14-day due dates
- Students or admin can mark a borrowed book as returned
- Available copy count updates automatically
- Sample books are added on first launch

## Run the project
1. Extract the ZIP file.
2. Open the `index.html` file in Chrome, Edge or Firefox.
3. Register a student account or use the admin demo login.

Admin demo:
- Email: `admin@library.com`
- Password: `Admin@123`

No database installation, terminal commands or package installation is needed.

## Project structure
```text
library-management-local-storage/
├── index.html
├── style.css
├── app.js
└── README.md
```

## Local Storage keys
- `booknest_users`: registered students and demo admin
- `booknest_books`: book catalogue and available copies
- `booknest_records`: borrow/return history
- `booknest_session`: currently logged-in user

## Important for your presentation
This is a frontend-only learning/demo project. Local Storage belongs to one browser profile on one device. It is not a shared database, and users can inspect or edit its contents. Passwords are stored as plain text in this beginner demo, so do not use real passwords or real personal data. For a real multi-user college system, use a backend, secure password hashing and a server-side database.

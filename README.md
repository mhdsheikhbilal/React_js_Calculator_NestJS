
---

#  Frontend – Calculator App (`README.md`)

```md
# Calculator Frontend (React + Vite)

This is the frontend for the Calculator application.  
It allows users to perform calculations and view, copy, and delete calculation logs stored in the backend.

---

##  Tech Stack

- React
- Vite
- JavaScript (ES6+)
- Tailwind CSS
- Fetch API

---

##  Project Structure

src/
├── components/
│ ├── Keypad.jsx
│ ├── Logs.jsx
│ └── Button.jsx
├── client.js
├── App.jsx
├── main.jsx
└── styles/

---

##  Environment Variables

Create a `.env` file in the frontend root:

```env
VITE_API_BASE_URL= backend_url

Restart frontend after editing .env.

---

**## Install Dependencies**

npm install

---

**## Run the App**

npm run dev
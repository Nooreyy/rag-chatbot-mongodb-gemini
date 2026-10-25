# Margot --- AI Companion

Margot is a full-stack AI chat application with a React/Vite frontend,
FastAPI backend, MongoDB persistence, JWT authentication, conversation
history, and a retrieval-augmented generation (RAG) chat workflow.

> **Configuration note:** `VITE_API_URL` is confirmed by the current
> frontend code. The backend environment-variable names below are
> conventional placeholders; make sure they match the names actually
> read by your Python configuration modules.

## Features

-   Email/password registration and login.
-   JWT bearer-token authentication for protected API requests.
-   AI chat interface with user and assistant messages.
-   Conversation IDs to group messages into sessions.
-   MongoDB persistence for users, conversations, and messages.
-   List and reopen previous conversations.
-   RAG-oriented retrieval before answer generation, depending on the
    configured ingestion and vector-search pipeline.
-   Dark interface with lime/green accents and loading/error states.

## Technology stack

  -----------------------------------------------------------------------
  Layer                   Technology              Purpose
  ----------------------- ----------------------- -----------------------
  Frontend                React, Vite             User interface and
                                                  development server

  Styling                 Tailwind CSS            Responsive styling and
                                                  theme

  Icons                   Lucide React            Interface icons

  Backend                 Python, FastAPI         API routes,
                                                  authentication, chat
                                                  orchestration

  Database                MongoDB                 Users, conversations,
                                                  messages, and any
                                                  configured retrieval
                                                  data

  Authentication          JWT, password           Authenticated access
                          hashing/verification    

  AI / RAG                Gemini integration and  Context retrieval and
                          embedding/vector        response generation
                          retrieval, as           
                          configured              
  -----------------------------------------------------------------------

## Architecture overview

``` text
Browser
  React + Vite
      |  VITE_API_URL
      v
  FastAPI backend
      |-- /auth/register
      |-- /auth/login
      |-- /chat/
      |-- /chat/conversations
      |-- /chat/{conversation_id}
      |
      |-- JWT validation and chat orchestration
      |-- Retrieval + AI provider integration
      |
      +------> MongoDB
      |          |-- users
      |          |-- conversations
      |          |-- messages
      |
      +------> Gemini / configured AI provider
```

### Message flow

1.  The user registers or signs in through the frontend.
2.  The backend looks up the account and verifies the submitted
    password.
3.  On successful login, the backend returns an access token.
4.  The frontend stores the token in browser `localStorage` and sends it
    in the `Authorization: Bearer <token>` header for protected
    requests.
5.  The frontend posts a message and the current conversation ID to
    `POST /chat/`.
6.  The backend creates a conversation if needed, stores the user
    message, retrieves relevant context using the configured RAG
    pipeline, generates an answer, stores the assistant message, and
    returns the answer and conversation ID.
7.  The frontend displays the answer and refreshes the history list.
8.  Selecting a saved conversation fetches its messages from the
    backend.

## Suggested project structure

Your actual filenames may differ; keep your repository's existing
structure.

``` text
margot/
├── frontend/
│   ├── .env
│   ├── package.json
│   └── src/
│       ├── App.jsx
│       ├── main.jsx
│       └── ...
├── backend/
│   ├── .env
│   ├── main.py                 # if this is your FastAPI entry point
│   ├── database.py
│   ├── auth/                   # if auth routes are in this package
│   └── llm/
│       ├── routes.py
│       └── history.py
├── README.md
└── .env.example
```

## Prerequisites

-   Node.js and npm.
-   Python version supported by the backend dependencies (Python 3.10+
    is a reasonable starting point).
-   MongoDB Atlas or a local MongoDB server.
-   A Gemini API key if the backend uses Gemini.
-   A MongoDB Vector Search index if your retrieval implementation uses
    Atlas Vector Search.

## Environment variables

Never commit real credentials. Keep `.env` files local and add them to
`.gitignore`.

### Frontend

The current React code reads `import.meta.env.VITE_API_URL`.

Create `frontend/.env` (or the `.env` file in the Vite app root):

``` dotenv
VITE_API_URL=http://127.0.0.1:8000
```

Restart Vite after changing environment variables.

### Backend

Create `backend/.env` with the values required by your Python
configuration. The root `.env.example` includes conventional names:

``` dotenv
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-host>/<database>?retryWrites=true&w=majority
MONGODB_DATABASE=margot
GEMINI_API_KEY=your_gemini_api_key_here
JWT_SECRET_KEY=replace_with_a_long_random_secret
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

These names must match what your Python modules read. A `.env` file is
not automatically loaded by every Python app; use the project's existing
settings loader (such as `python-dotenv` or Pydantic Settings). Never
put real secrets in the README or source code.

## Local setup

### 1. Get the project

``` bash
git clone <your-repository-url>
cd <your-repository-folder>
```

If the project is already on your computer, open a terminal at its root.

### 2. Configure MongoDB

1.  Create a database or select an existing one.
2.  For MongoDB Atlas, create a database user and allow your development
    IP under Network Access.
3.  Put the connection string in the backend environment file.
4.  Confirm the database and collection names match
    `backend/database.py`.
5.  If using vector retrieval, create the vector index expected by your
    retrieval code.

### 3. Create a Python virtual environment

Windows PowerShell:

``` powershell
py -m venv .venv
.venv\Scripts\Activate.ps1
```

macOS/Linux:

``` bash
python3 -m venv .venv
source .venv/bin/activate
```

Install dependencies using the requirements file that actually exists in
your repository. If it is in `backend/`:

``` bash
pip install -r backend/requirements.txt
```

If it is in the root:

``` bash
pip install -r requirements.txt
```

### 4. Start FastAPI

Create `backend/.env`, then run the app. Replace `backend.main:app` if
your FastAPI instance lives in a different module:

``` bash
uvicorn backend.main:app --reload
```

The default development address is commonly `http://127.0.0.1:8000`.
Open `http://127.0.0.1:8000/docs` for Swagger UI.

### 5. Start the frontend

In a second terminal:

``` bash
cd frontend
npm install
```

Create `frontend/.env`:

``` dotenv
VITE_API_URL=http://127.0.0.1:8000
```

Then run:

``` bash
npm run dev
```

Open the local URL printed by Vite, commonly `http://localhost:5173`.

## API overview

The following paths reflect the routes discussed in this project.
Confirm request/response details in your route files or Swagger UI.

  ---------------------------------------------------------------------------------
  Method            Endpoint                    Purpose           Auth
  ----------------- --------------------------- ----------------- -----------------
  `POST`            `/auth/register`            Register an       No
                                                account           

  `POST`            `/auth/login`               Verify            No
                                                credentials and   
                                                return an access  
                                                token             

  `POST`            `/chat/`                    Send a message    Bearer token
                                                and receive an AI 
                                                response          

  `GET`             `/chat/conversations`       List the          Bearer token
                                                signed-in user's  
                                                conversations     

  `GET`             `/chat/{conversation_id}`   Load messages for Bearer token
                                                one conversation  
  ---------------------------------------------------------------------------------

Example request body for a new chat:

``` json
{
  "message": "Explain this topic simply.",
  "conversation_id": null
}
```

Use the `conversation_id` returned by the backend to continue an
existing conversation.

## MongoDB data model

The history code shared for this project uses these logical collections.
Actual collection names are defined in your database module.

### Users

Contains account information, including email and a hashed password.
Never store plain-text passwords.

### Conversations

Typical fields include `user_id`, `title`, and `created_at`.

### Messages

Typical fields include `conversation_id`, `user_id`, `role`, `content`,
and `created_at`. Roles are typically `user` and `assistant`.

The backend should check conversation ownership before returning
history.

## Test checklist

1.  Register a new account.
2.  Sign in with the account.
3.  Send a message and confirm an assistant answer appears.
4.  Start a new chat and verify it has its own conversation ID.
5.  Open a saved conversation and confirm its messages load.
6.  Sign out and confirm the authentication screen returns.
7.  Try an unregistered email and an incorrect password to verify the
    expected error messages.

## Troubleshooting

### Frontend cannot connect to FastAPI

-   Check `VITE_API_URL`.
-   Ensure FastAPI is running at the configured address and port.
-   Restart Vite after editing `.env`.
-   Inspect the browser Console and Network tabs.

### CORS errors

-   Allow the frontend origin in the backend CORS settings, commonly
    `http://localhost:5173`.
-   If you use `127.0.0.1` in the browser, allow that origin too.
-   Restart the backend after changing CORS settings.

### MongoDB connection failure

-   Check URI, credentials, database name, and Atlas IP access.
-   URL-encode special characters in the database password.

### Authentication problems

-   Make sure registration and login use the same users collection.
-   Make sure registration hashes passwords and login uses the matching
    verification function.
-   Ensure the frontend handles the response format actually returned by
    FastAPI.
-   Protected endpoints require `Authorization: Bearer <access_token>`.

### AI or retrieval failure

-   Confirm the API key exists and its variable name matches the backend
    code.
-   Check backend logs for provider, rate-limit, model, retrieval, or
    vector-index errors.
-   For vector search, verify the index name, embedding dimensions, and
    stored vector format match the retrieval implementation.

### Missing Python package

-   Activate the virtual environment.
-   Install from the project's real requirements file.
-   Run Uvicorn from a directory where the package imports resolve
    correctly.

## Security notes

-   Do not commit `.env` files, API keys, MongoDB credentials, or JWT
    secrets.
-   Use a long random JWT secret outside local development.
-   Use HTTPS in production and restrict CORS to trusted origins.
-   Store password hashes, never raw passwords.
-   Validate ownership for every conversation-history request.
-   Add suitable rate limiting and production token-lifecycle controls
    before deployment.
-   The current frontend uses `localStorage` for the access token;
    review the security trade-offs before production deployment.

## Before publishing

Verify these repository-specific details before treating the setup
commands as final:

-   Actual FastAPI entry-point module.
-   Location of `requirements.txt`.
-   Exact backend environment-variable names.
-   MongoDB database and collection names.
-   AI model, embedding dimensions, and vector-index name.

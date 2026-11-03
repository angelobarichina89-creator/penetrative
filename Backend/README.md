# Library & Digital Asset Management API

Express and MySQL backend for the Penetrative Library frontend. The server uses
the database schema in `../Frontend/penetrative_library.sql` and serves the
frontend from `../Frontend`.

## Requirements

- Node.js 18 or later
- MySQL 8 or later
- Python 3.10 or later with the TinyFish SDK installed to enable AI search

## Setup

In PowerShell, open the backend directory and install the Node dependencies:

```powershell
cd "C:\path\to\penetrative\Backend"
npm install
Copy-Item .env.example .env
```

Configure `.env` with your MySQL details and `TINYFISH_API_KEY`. The key is
private; do not commit `.env` or paste the key into frontend code.

Install the Python dependencies required by the TinyFish integration:

```powershell
python -m pip install -r "..\Ai integration\brand new type of box\requirements.txt"
```

If `python` does not refer to the Python installation with TinyFish installed,
set `TINYFISH_PYTHON` in `.env` to that interpreter's executable path.

Import `../Frontend/penetrative_library.sql` into MySQL using MySQL Workbench or
the MySQL command-line client. The SQL script creates and selects the
`penetrative_library` database, its tables, triggers, procedures, views, and
seed catalog data.

Start the server:

```powershell
npm start
```

The API base URL is `http://localhost:5000/api`; the frontend is at
`http://localhost:5000/`. Check the database connection at
`http://localhost:5000/api/test-db`.

## Environment variables

| Variable | Description |
|---|---|
| `PORT` | HTTP port; defaults to `5000` |
| `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` | MySQL connection settings |
| `DB_CONNECTION_LIMIT` | Maximum number of MySQL pool connections |
| `AUTH_TOKEN_SECRET` | Random secret of at least 32 characters used to sign login tokens; set this in production |
| `TOKEN_TTL_SECONDS` | Token lifetime in seconds; defaults to seven days |
| `FINE_PER_DAY` | Per-day overdue fine estimate; defaults to `10` |
| `TINYFISH_API_KEY` | Enables TinyFish-powered AI chat, book discovery, and recommendations |
| `TINYFISH_PYTHON` | Python executable with TinyFish installed; defaults to `python` on Windows |
| `ADMIN_USERNAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` | Used only by the admin setup script |

When `AUTH_TOKEN_SECRET` is blank in development, the server generates a
temporary secret at startup, so login tokens become invalid after a restart.
Production startup requires a configured secret.

## Authentication and account setup

Register or log in to receive a bearer token. Include it on protected requests:

```http
Authorization: Bearer <token>
```

New accounts are members. Author sign-ups can include
`signupType: "author"`, `pen_name`, and `bio`; librarians or administrators can
review applications. Administrators can manage roles. Administrators and
librarians can manage the catalog, and approved authors can manage books they
uploaded.

To create the first administrator, set `ADMIN_USERNAME`, `ADMIN_EMAIL`, and a
password of at least 12 characters in `.env`, then run:

```powershell
node seed-admin.js
```

The script refuses to create another administrator if one already exists.
Remove the administrator password from `.env` after setup if it is no longer
needed.

To reset a member password, set it for the command and pass the member's email:

```powershell
$env:NEW_PASSWORD = Read-Host "New password"
node reset-member-password.js member@example.com
Remove-Item Env:NEW_PASSWORD
```

The new password must be at least eight characters and use only letters,
numbers, `_ @ - # ? !`.

## API routes

Protected routes require a bearer token unless otherwise noted. Request and
response bodies are JSON.

| Method | Route | Description / access |
|---|---|---|
| `GET` | `/api` | API health check |
| `GET` | `/api/test-db` | Check MySQL connectivity |
| `POST` | `/api/auth/register`, `/api/users/register` | Public registration |
| `POST` | `/api/auth/login`, `/api/users/login` | Public login |
| `GET`, `PUT` | `/api/users/me` | View or update the signed-in member's profile |
| `PUT` | `/api/users/me/password` | Change the signed-in member's password |
| `GET` | `/api/users` | Admin or librarian: list users |
| `GET`, `PUT`, `DELETE` | `/api/users/:id` | View a user or administer an account |
| `GET`, `POST`, `PUT`, `DELETE` | `/api/categories`, `/api/categories/:id` | List and manage categories; write access is staff-only |
| `GET`, `POST`, `PUT`, `DELETE` | `/api/books`, `/api/books/:id` | Search, view, create, update, and delete books |
| `GET` | `/api/authors` | Author directory from catalog records |
| `GET` | `/api/authors/applications` | Admin or librarian: review author applications |
| `PUT` | `/api/authors/me` | Submit or update an author application |
| `PATCH`, `DELETE` | `/api/authors/:userId` | Review or remove an author profile |
| `GET`, `POST`, `PUT`, `DELETE` | `/api/borrows`, `/api/borrows/:id` | List, create, update, or delete loans |
| `PUT` | `/api/borrows/:id/return` | Return a loan and calculate an estimated fine |
| `GET`, `PUT`, `DELETE` | `/api/cart`, `/api/cart/:bookId` | View and manage the signed-in member's cart |
| `POST` | `/api/cart/checkout` | Check out the cart using the database procedure |
| `GET`, `POST`, `PUT` | `/api/subscriptions` | View premium status, upgrade, or cancel the signed-in member's subscription |
| `PUT` | `/api/books/:bookId/rating` | Add or update a book rating |
| `GET`, `POST`, `PUT`, `DELETE` | `/api/messages` | Send, list, mark read, or delete direct messages |
| `GET`, `POST`, `PUT`, `DELETE` | `/api/support` | Member support conversations and staff replies |
| `POST` | `/api/ai/chat` | TinyFish web search for an assistant question |
| `POST` | `/api/ai/search` | TinyFish search using a natural-language book or plot description |
| `POST` | `/api/ai/recommendations` | TinyFish book recommendations from a reading preference |
| `GET` | `/api/admin/stats` | Admin or librarian: library statistics |

Book listing supports `search`, `category`, `status=available|borrowed|all`,
`is_premium=true|false`, and `sort=title|author|year|rating`, with optional
`limit` and `offset` pagination.

AI requests use the TinyFish SDK in the existing Python integration. The current
TinyFish endpoints return web search results; they do not generate summaries
from the library's book descriptions. Do not send passwords, payment details,
or other sensitive information to AI endpoints.

## Notes

- Database triggers enforce borrowing availability, the active-loan limit, and
  premium-book access.
- Fines are estimates calculated with `FINE_PER_DAY`; the schema does not
  include a fine-payment ledger.
- Subscription procedures record membership transactions; payment processing
  is outside this API.
- The frontend currently uses browser storage for application data. It must
  call these API routes to persist data in MySQL.
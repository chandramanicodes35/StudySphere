# StudySphere - Collaborative Study Room Platform

StudySphere (also known as Collaborative Study Room Platform) is a modern, full-stack, real-time virtual co-working space built to break the isolation of remote learning. Students can group up in shared focus spaces, synchronize Pomodoro concentration bursts, chat live, build daily study streaks, edit shared lecture summaries, listen to lofi ambient soundtracks, and analyze their learning consistency over time.

---

## 🚀 Core Features

### 1. Authentication
- **User Authentication**: Secure user registration, sign-in, and sign-out endpoints using **JSON Web Tokens (JWT)**.
- **Credential Protection**: Passwords securely hashed using standard `bcryptjs` salt rounds on database entry.
- **Route Protections**: Custom frontend React protective wrapper routing components that block non-authenticated access.
- **Personal Configurations**: Customize avatar identifiers, modify focus targets, and scale ambient audio levels.

### 2. Study Room Management
- **Room Spawning**: Create public or private virtual co-working study spaces.
- **Invitation System**: Automatically generate unique 6-character room codes for rapid connection sharing.
- **Room Roster**: Track room details, creator badges, active lists, and online co-workers.
- **Leave Actions**: Support safe room exit routes updating active participant directories.

### 3. Session Timer
- **Synced Timer Engine**: central backend timing loops synchronized to the second across all room participants.
- **Sprint Presets**: Switch between custom study intervals: Focus Sprint (25m), Short Break (5m), or Long Break (15m).
- **Alarm Bells**: Play alerts for all room members automatically when sprint periods exhaust.
- **Automated Logging**: Completed study times are logged directly to Mongoose, crediting active occupants with focus hours.

### 4. Room Chat
- **Instant Messaging**: Real-time communication chat boxes that render messages without manual page refreshes.
- **System Announcements**: Propagate system updates automatically when colleagues enter or exit.
- **Typing Indicators**: Animate and display typing notifications when co-workers compose messages.

### 5. Realtime Room Updates
- **Roster Synchronizer**: Broadcast participant listings in real-time as users connect or disconnect.
- **Live State Sync**: Propagate current timer status and remaining countdown durations immediately on new connection arrivals.
- **Cooperative Notepad**: Share and update lecture summaries on room-level canvases concurrently.

### 6. Activity Dashboard
- **Productivity Dashboard**: Summarize focus sprint counts, active study streaks, total focus hours, and current room counts.
- **Focus Trend Graph**: Plot weekly study times by day using custom reactive SVG area charts with theme-harmonized gradient fills.
- **Timeline Logs**: Catalog a detailed chronological feed of previous co-working sessions.

## 👥 User Stories

As a user of StudySphere, I should be able to:
- **Create study rooms**: Create custom virtual co-working study spaces.
- **Invite other users**: Share an invitation code to invite colleagues.
- **Start study sessions**: Launch synchronized Pomodoro study cycles.
- **Track session durations**: Monitor focus durations and update stats.
- **Communicate within the room**: Chat in real-time and update notes.
- **View room activity history**: Review chronological co-working logs.

---

## 🛠️ Technology Stack

- **Frontend Core**: React 18 (Single Page Application via Vite)
- **Styling Layout**: Tailwind CSS v3 (integrated using PostCSS)
- **Icons Toolkit**: Lucide React SVG Library
- **Backend Service**: Node.js + Express
- **Database Engine**: MongoDB (managed via Mongoose ODM)
- **Real-Time Sync**: Socket.IO (WebSockets with fallback polling)

---

## 📂 Project Directory Structure

```
d:\New folder (3)
├── package.json             # Root monorepo scripts for concurrent runs
├── README.md                # Comprehensive project documentation (This file)
├── backend/
│   ├── src/
│   │   ├── config/          # Database (Mongoose) initialization
│   │   ├── controllers/     # Auth, Room, and Stats REST logic controllers
│   │   ├── middleware/      # JWT verification protective interceptors
│   │   ├── models/          # Mongoose Schema Definitions (User, Room, Session, Msg, Activity)
│   │   ├── routes/          # Express REST API routing maps
│   │   ├── sockets/         # Socket.IO event handler for Pomodoro, Chat, Notes sync
│   │   └── server.js        # Server entrypoint initializing HTTP, Express, and Socket.IO
│   ├── .env.example         # Template for environment values
│   ├── .env                 # Active development configurations
│   ├── package.json         # Backend Node dependencies
│   └── README.md            # Backend instructions
└── frontend/
    ├── src/
    │   ├── main.jsx         # React DOM rendering entrypoint
    │   ├── App.jsx          # Route paths mapping and sidebar panel wraps
    │   ├── index.css        # Tailwind layers, lofi visualizers, and glass card styling
    │   ├── components/      # Reusable visual widgets (Sidebar, Charts, Stats, SoundPlayer)
    │   ├── context/         # Auth, WebSockets, and Active Study Room state contexts
    │   ├── pages/           # Pages (Landing, Login, Signup, Dashboard, RoomDetails, Settings, Logs)
    │   └── services/        # Axios custom client pointing to /api
    ├── index.html           # Document template containing Google Font hooks
    ├── vite.config.js       # Vite proxy setup mapping /api and WebSockets locally
    ├── tailwind.config.js   # Tailwind theme configurations
    ├── postcss.config.js    # PostCSS parsing Tailwind configuration
    ├── package.json         # Frontend Vite and React dependencies
    └── README.md            # Frontend instructions
```

---

## ⚙️ Environment Variables Configuration

Create a `.env` file in the `/backend` folder with the following variables:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/studysphere
JWT_SECRET=supersecretstudyspherejwtkey12345!
FRONTEND_URL=http://localhost:3000
```

*Note: The project is fully configured to operate using a local MongoDB instance. If using MongoDB Atlas in production, simply swap `MONGODB_URI` with your connection string.*

---

## 🏃 Setup & Execution Instructions

Follow these simple steps to run the full application locally:

### 1. Prerequisites
Ensure that you have **Node.js** (v18+ recommended) installed on your system, and that **MongoDB** is running locally (e.g. at `mongodb://localhost:27017`).

### 2. Install All Dependencies
Run the following script at the root directory (`d:\New folder (3)`) to automatically install packages for the root, backend, and frontend folders:
```bash
npm run install:all
```

### 3. Launch Development Servers
Start both the Express server (port `5000`) and the Vite + React client (port `3000`) concurrently with a single command:
```bash
npm run dev
```

The terminal will launch both services:
- **Client Application**: Available at [http://localhost:3000](http://localhost:3000)
- **Backend API Server**: Health checks available at [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## 📡 Socket.IO Real-Time Actions

The synchronized co-working system operates using the following WebSocket interactions:

| Client Event | Payload | Purpose |
|:---|:---|:---|
| `join_room` | `{ roomCode, user }` | Joins a room socket channel, maps indicators, sends initial state. |
| `start_timer` | `{ roomCode, duration, type }` | Initiates backend interval countdown ticks for the room. |
| `pause_timer` | `{ roomCode }` | Freezes active backend countdown tick intervals. |
| `reset_timer` | `{ roomCode, duration, type }` | Re-aligns countdown timers to idle focus or break states. |
| `send_message` | `{ roomCode, content }` | Commits chat content to database, broadcasts populated message. |
| `typing` | `{ roomCode, isTyping }` | Propagates active student typing flags. |
| `update_notes` | `{ roomCode, notes }` | Distributes real-time collaborative text note shifts. |
| `leave_room` | `{ roomCode, user }` | Disconnects occupant and updates participant rosters. |

---

## 💡 Code Quality & Architectural Practices

- **Security Integrity**: Passwords hashed securely using `bcryptjs` before committing to MongoDB. Private API paths validated using JWT verification headers.
- **Dynamic Modular Components**: Context states cleanly isolate credentials authentication (`AuthContext`), socket connections (`SocketContext`), and room focus intervals (`RoomContext`).
- **Decoupled Operations**: Frontend requests point to clean `/api` paths proxying requests seamlessly, keeping deployment modular.
- **Zero-Dependency Graphics**: Heavy third-party plotting frameworks are completely avoided, utilizing responsive SVG area charts for statistics.

# CogniTrack: Architecture & Application Flow

## Component Flow
The application follows a strictly decoupled client-server architecture.

### 1. User Interaction (Frontend)
- The user lands on the Home screen (`App.jsx`), which displays a 3-column responsive grid.
- The grid contains the 4 Game Modules and the central Clinical Dashboard.
- The user selects a game, triggering a component mount (e.g., `MemoryGame.jsx`).

### 2. Game Execution & Telemetry Collection
- The game component initializes its local state (`gameState = 'playing'`).
- As the user plays, `useRef` and `performance.now()` are used to capture highly accurate, non-blocking telemetry (e.g., arrays of `reactionTimes`, counts of `omissionErrors`).
- Upon completion (`gameState = 'complete'`), the local state calculates aggregate metrics (e.g., `avg_reaction_time`).

### 3. API Communication
- The frontend invokes a utility function from `api.js` (e.g., `submitSpeedMetrics(payload)`).
- A `POST` request is fired to the FastAPI backend (e.g., `POST /api/metrics/speed`).

### 4. Machine Learning & Database Update (Backend)
- FastAPI routes the raw metrics to `ml_service.py`.
- The ML Service evaluates the raw numbers against heuristic clinical rules (e.g., `if accuracy < 0.6 and time > 15000: return 'Low'`).
- The backend retrieves the existing `CognitiveProfile` for the `child_id` from MongoDB.
- The specific cognitive domain is updated with the new classification string, and the profile is saved back to MongoDB.
- FastAPI returns a success response with AI-generated recommendations.

### 5. Dashboard Rendering
- The user navigates to the Clinical Dashboard.
- `ClinicalDashboard.jsx` mounts and triggers a `GET /api/profile/{child_id}` request.
- The frontend receives the unified `CognitiveProfile`.
- A utility function maps categorical strings (`"High"`, `"Medium"`, `"Low"`) into numeric radar coordinates (`90`, `50`, `20`).
- Recharts renders the SVG polygon, providing immediate visual feedback of the patient's entire cognitive footprint.

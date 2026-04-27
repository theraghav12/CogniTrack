# CogniTrack: Technical Knowledge Base

## Tech Stack Overview
CogniTrack is a full-stack, modular web application built with a modern React and Python ecosystem.

### Frontend
- **Framework**: React.js (Bootstrapped with Vite)
- **Styling**: Tailwind CSS (Extensively utilizing arbitrary values, gradients, glassmorphism, and custom animations)
- **Data Visualization**: Recharts (Specifically utilizing `RadarChart`, `PolarGrid`, `PolarAngleAxis`, and `Radar` components for the cognitive map)
- **Routing**: Client-side state routing (Game states managed via `App.jsx` layout wrapper)

### Backend
- **Framework**: FastAPI (Python)
- **Database**: MongoDB (via `motor` asynchronous driver)
- **Machine Learning Integration**: Mocked Scikit-Learn logic (Rules-based evaluation functions in `ml_service.py` that analyze latency and error rates to output clinical heuristics).

## Clinical Psychology Mapping
The application gamifies four validated neuropsychological assessments:
1. **Go/No-Go Task** $\rightarrow$ Measures Sustained Attention & Response Inhibition (Impulse Control).
2. **Corsi Block-Tapping Task** $\rightarrow$ Measures Visuospatial Working Memory Span.
3. **Dimensional Change Card Sort (DCCS)** $\rightarrow$ Measures Cognitive Flexibility and Executive Function.
4. **Trail Making Test (Part B)** $\rightarrow$ Measures Processing Speed, Alternating Attention, and Visual Search.

## Data Schema (`models.py`)
- **Telemetry Models**: `GameSessionMetrics`, `MemorySessionMetrics`, `FlexibilitySessionMetrics`, `SpeedSessionMetrics`. Each collects raw data (e.g., `reaction_time_ms`, `omission_errors`, `max_span`, `accuracy_rate`).
- **Profile Model**: `CognitiveProfile`. A cumulative, persistent record stored in MongoDB containing categorical string values (`"High"`, `"Medium"`, `"Low"`) for each cognitive domain (`attention_score`, `impulsivity_score`, `working_memory_score`, `cognitive_flexibility_score`, `processing_speed_score`).

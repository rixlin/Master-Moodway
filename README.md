# Master Moodway

> Feeling like you're about to crash out? Reach your inner peace with Master Moodway.

Master Moodway is an emotional support tool that tracks user anger in real-time using Deepface and Wav2Vec2.

Built for Rutgers IEEE X HART Build-a-thon (Spring 2026).

## Usage

### Backend

To run the backend, create and activate the virtual environment, then navigate to the `backend` directory:

```bash
python -m venv .venv
.\venv\Scripts\Activate.ps1 # Windows-only
cd backend
```

Install its required dependences and start the server:

```bash
pip install -r requirements.txt
python server.py
```

### Frontend

To run the frontend, navigate to the `frontend` directory.

```bash
cd frontend
```

Install its required dependencies and start the interface:

```bash
npm install
npm run start
```

> [!IMPORTANT]
> While you can start the frontend before starting the backend, the program will *not* work without it.

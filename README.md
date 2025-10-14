# Stock Search

A full-stack stock search application with a Next.js frontend and FastAPI backend.

## Project Structure

```
stock-search/
├── frontend/          # Next.js application
│   ├── src/
│   ├── public/
│   └── ...
├── backend/           # FastAPI application
│   ├── main.py
│   ├── requirements.txt
│   └── ...
└── README.md         # This file
```

## Getting Started

### Frontend (Next.js)

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`

For more details, see the [frontend README](./frontend/README.md).

### Backend (FastAPI)

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create and activate a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On macOS/Linux
# venv\Scripts\activate   # On Windows
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Run the development server:
```bash
uvicorn main:app --reload --port 8000
```

The backend API will be available at `http://localhost:8000`

For more details, see the [backend README](./backend/README.md).

## Tech Stack

- **Frontend**: Next.js 15, React, TypeScript
- **Backend**: FastAPI, Python
- **Styling**: Tailwind CSS (Next.js)

## Development

Both the frontend and backend can run simultaneously:
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8000`
- API Documentation: `http://localhost:8000/docs`

## License

This project is open source and available under the MIT License.

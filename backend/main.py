"""
Main FastAPI application for Stock Search API.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import candlestick, news, analysis

app = FastAPI(
    title="Stock Search API",
    description="Backend API for stock search application",
    version="1.0.0"
)

# Configure CORS to allow requests from the Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Next.js default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(candlestick.router)
app.include_router(news.router)
app.include_router(analysis.router)


@app.get("/")
async def root():
    return {"message": "Welcome to Stock Search API"}


@app.get("/health")
async def health_check():
    return {"status": "healthy"}

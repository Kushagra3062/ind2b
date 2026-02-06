# Ind2b E-commerce Platform

This project is a hybrid e-commerce platform featuring an advanced AI recommender system. It consists of a modern Next.js frontend and a Python FastAPI backend for recommendation logic.

## Project Structure

- **PortalWeb**: The frontend application built with Next.js 15, Tailwind CSS, and Redux.
- **ind2b_recommender**: The backend recommendation engine built with Python and FastAPI.

## Prerequisites

- **Node.js** (v18 or higher recommended)
- **Python** (v3.10 or higher recommended)
- **MongoDB** (Ensure you have a running instance or connection string)

## Installation & Setup

### 1. Frontend (PortalWeb)

Navigate to the frontend directory:
```bash
cd PortalWeb
```

Install dependencies:
```bash
npm install
```

**Environment Variables:**
Create a `.env.local` file in `PortalWeb/` and add your environment variables (refer to `.env.example` if available, or ensure you have values for `MONGODB_URI`, `NEXTAUTH_SECRET`, etc.).

### 2. Backend (ind2b_recommender)

Navigate to the backend directory:
```bash
cd ind2b_recommender
```

Create and activate a virtual environment:
```bash
# Windows
python -m venv venv
.\venv\Scripts\activate

# macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

Install Python dependencies:
```bash
pip install -r requirements.txt
```

**Environment Variables:**
Create a `.env` file in `ind2b_recommender/` with necessary API keys (e.g., `OPENAI_API_KEY`, database credentials).

## Running the Application

You will need to run both the frontend and backend servers simultaneously. Open two separate terminal windows.

### Terminal 1: Start Backend API

```bash
cd ind2b_recommender
# Ensure your virtual environment is activated
# .\venv\Scripts\activate

python api/main.py
```
*The backend API will start on `http://localhost:8000`*

### Terminal 2: Start Frontend App

```bash
cd PortalWeb
npm run dev
```
*The frontend application will start on `http://localhost:3000`*

## Features

- **Storefront**: Browse products with a modern UI.
- **AI Chatbot**: Context-aware shopping assistant powered by the recommender system.
- **Hybrid Recommendations**: Product suggestions based on user behavior and semantic search.

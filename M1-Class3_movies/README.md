# Movie Recommender — ChromaDB Vector Search

Movie recommendation system using **vector search** with **ChromaDB**.
Age and likes have **equal weight** in the recommendation.

## Architecture

```
┌─────────────┐     ┌─────────────────┐     ┌──────────────┐
│   Frontend   │────▶│    Backend API   │────▶│   ChromaDB   │
│   React +    │     │   Express.js    │     │  (vectors)   │
│   Vite       │◀────│   Port 3001     │◀────│  Port 8000   │
│   Port 5173  │     └─────────────────┘     └──────────────┘
└─────────────┘
```

## How it works

1. **500 movies** are generated and stored in ChromaDB as 14-dimensional vectors
2. Each vector encodes: genre (one-hot), age rating, likes, rating and year
3. **Weights**: likes × 1.0 | age × 1.0 | rating × 1.0 | year × 0.5
4. When searching, the system builds a preference vector and finds the **N nearest neighbors** (e.g. 100) via cosine similarity
5. Clicking a movie shows the 100 most similar movies in the vector space
6. **10 user profiles** with liked movies — select a profile to see their likes and personalized recommendations

## Stack

| Layer    | Technology               |
|----------|--------------------------|
| Frontend | React 19 + Vite          |
| Backend  | Node.js + Express        |
| Vectors  | ChromaDB (Docker)        |
| Search   | Cosine similarity (HNSW) |

## Prerequisites

- Node.js 18+
- Docker + Docker Compose

## Setup

```bash
# 1. Start ChromaDB
docker compose up -d

# 2. Backend — install, seed and start
cd backend
npm install
npm run seed    # seeds 500 movies into ChromaDB
npm run dev     # starts API at http://localhost:3001

# 3. Frontend (in another terminal)
cd frontend
npm install
npm run dev     # starts at http://localhost:5173
```

Or all at once (from root):
```bash
npm start       # docker compose up + seed + backend + frontend
npm run stop    # kills everything
```

## API

| Method | Route                      | Description                      |
|--------|----------------------------|----------------------------------|
| GET    | `/api/health`              | Server + ChromaDB status         |
| GET    | `/api/movies/stats`        | Totals and metadata              |
| GET    | `/api/movies/catalog`      | Full catalog grouped by genre    |
| GET    | `/api/movies/:id`          | Movie details                    |
| GET    | `/api/movies/:id/similar`  | 100 similar movies (vector)      |
| POST   | `/api/recommend`           | Recommend by age + genres        |
| GET    | `/api/users`               | List all user profiles           |
| GET    | `/api/users/:id/likes`     | Movies liked by a user           |
| GET    | `/api/users/:id/recommend` | Recommendations for a user       |
| GET    | `/api/users/by-movie/:id`  | Users who liked a movie          |

## Embedding (14 dimensions)

```
[genre_action, genre_comedy, ..., genre_adventure,  ← 10 dims (one-hot)
 age_rating × 1.0,                                  ← age (equal weight)
 likes × 1.0,                                       ← likes (equal weight)
 rating × 1.0,                                      ← rating (equal weight)
 year × 0.5]                                        ← year
```

Age, likes and genre all have equal influence on the vector search results.

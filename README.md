# QuerySense

## Overview

QuerySense is an advanced database querying tool that transforms natural language into powerful SQL queries. Built for data teams who want to move faster without sacrificing accuracy, QuerySense supports multiple database types and provides an intuitive, AI-powered interface for database interactions.

## Features

- 🌐 Multi-Database Support
  - MySQL
  - PostgreSQL
  - SQLite
  - More coming soon!

- 🤖 AI-Powered Query Generation
  - Natural language to precise SQL queries
  - Contextual understanding
  - Schema-aware processing

## Prerequisites

- Node.js (v20 or later)
- npm, yarn, or pnpm
- Database credentials for supported databases

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/ayush110404/query-sense.git
cd query-sense
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3. Set Up Environment Variables

Create a `.env.local` file in the project root and add the following:

```env
PUBLIC_URL="http://localhost:3000"

# JWT Configurations
JWT_SECRET=jwt_secret_key
JWT_EXPIRES_IN=database_connection_expiration_time

# AI Service
GEMINI_API_KEY=your_google_ai_api_key

# Authentication
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supbase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supbase_service_key

```

### 4. Run the Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Tech Stack

- **Framework**: Next.js 15
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn/ui
- **Authentication**: Custom JWT-based
- **AI Integration**: Google Generative AI
- **Database Support**: MySQL, PostgreSQL, SQLite
---

**QuerySense** - Simplifying Database Queries with AI

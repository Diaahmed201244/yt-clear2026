# Overview

This is a real-time multiplayer gambling card game application built with React, Express, and WebSocket communication. The application simulates a poker-style gambling game with an AI dealer (Lady Victoria) managing game flow, card dealing, and winner determination. Players join games with entry stakes, receive cards, and compete for pot winnings through simplified poker mechanics.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **React 18** with TypeScript for the user interface
- **Vite** as the build tool and development server
- **Wouter** for client-side routing
- **TanStack Query** for server state management and caching
- **Tailwind CSS** with **shadcn/ui** components for styling
- **WebSocket** client for real-time game communication

## Backend Architecture
- **Express.js** server with TypeScript
- **WebSocket Server** (ws library) for real-time multiplayer communication
- **In-memory storage** with interface for future database integration
- **RESTful API** endpoints for game management
- **Game logic engine** for card dealing, hand evaluation, and winner determination

## Data Flow
1. Players connect via WebSocket and join games through REST API
2. Game state updates broadcast to all connected players in real-time
3. AI dealer manages turn progression, card dealing, and pot distribution
4. Client-side game state management synchronizes with server events
5. Winner determination triggers pot distribution and round completion

# Key Components

## Game Engine
- **Card System**: Standard 52-card deck with shuffle algorithms
- **Hand Evaluation**: Poker-style hand ranking (pairs, straights, flushes, etc.)
- **AI Dealer**: Automated game master handling stakes, dealing, and announcements
- **Turn Management**: Timer-based turn system with automatic progression

## Real-time Communication
- **WebSocket Connections**: Persistent connections for each game session
- **Message Broadcasting**: Game state updates sent to all players simultaneously
- **Connection Management**: Automatic reconnection with exponential backoff
- **Game Room System**: Isolated communication channels per game

## User Interface
- **Game Table View**: Visual representation of players around a poker table
- **Card Display**: Animated card dealing and reveal mechanics
- **Dealer Interface**: AI announcements and game status updates
- **Player Controls**: Fold, play card, and stake management buttons

# Data Storage

## Current Implementation
- **In-memory storage** using Maps and arrays for development
- **Storage Interface** (IStorage) defines contracts for data operations
- **Structured data models** for users, games, players, and game history

## Database Schema (Drizzle ORM Ready)
- **Users**: Player accounts with balances and authentication
- **Games**: Game sessions with status, pot, community cards, and timing
- **GamePlayers**: Player participation in specific games with hands and stakes
- **GameHistory**: Action logging for game replay and debugging

## Data Models
- **Card**: Suit and value representation
- **Game**: Complete game state including phase, pot, and community cards
- **GamePlayer**: Individual player state within a game
- **GameAction**: Player actions (join, fold, play card, etc.)

# External Dependencies

## Core Libraries
- **@neondatabase/serverless**: Database connection (Postgres-compatible)
- **drizzle-orm**: Type-safe ORM with schema definitions
- **ws**: WebSocket server implementation
- **express**: HTTP server framework

## UI Components
- **@radix-ui/***: Accessible UI primitives (dialogs, buttons, forms)
- **@tanstack/react-query**: Server state management
- **class-variance-authority**: Utility-first styling system
- **tailwindcss**: CSS framework

## Development Tools
- **vite**: Fast build tool with HMR
- **typescript**: Type safety and development experience
- **tsx**: TypeScript execution for server development

# Deployment Strategy

## Build Process
1. **Client Build**: Vite compiles React app to static assets
2. **Server Build**: esbuild bundles Express server to single file
3. **Asset Organization**: Client files served from `/dist/public`

## Environment Configuration
- **Development**: Vite dev server with Express API proxy
- **Production**: Express serves both API and static client files
- **Database**: PostgreSQL via environment variable `DATABASE_URL`

## Replit Integration
- **Runtime Error Modal**: Development error overlay
- **Cartographer Plugin**: Replit-specific development tools
- **Auto-banner**: Development environment identification

## Key Scripts
- `npm run dev`: Development with hot reload
- `npm run build`: Production build for both client and server
- `npm run start`: Production server startup
- `npm run db:push`: Database schema deployment

The application is designed as a complete multiplayer gaming platform with room for expansion into more complex card games and betting mechanics while maintaining the core real-time multiplayer foundation.
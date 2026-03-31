# Chess Application

## Overview

This is a full-stack chess application built with React on the frontend and Express.js on the backend. The application supports playing chess against AI, multiplayer games, and spectating games. It features a modern UI built with shadcn/ui components and uses PostgreSQL for data persistence with Drizzle ORM.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

The application follows a modern full-stack architecture with clear separation between client and server:

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query for server state management
- **UI Framework**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **Chess Logic**: chess.js library for game logic and validation
- **Board Rendering**: react-chessboard for interactive chess board

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Development**: Hot module replacement with Vite integration
- **Build**: ESBuild for production bundling
- **Session Management**: PostgreSQL session store (connect-pg-simple)

## Key Components

### Database Schema
The application uses four main tables:
- **users**: Player profiles with ratings and authentication data
- **games**: Game sessions with state, players, time controls, and results
- **moves**: Individual chess moves with notation, timing, and position data
- **chat_messages**: In-game chat for multiplayer sessions

### Chess Engine Integration
- AI opponent using Stockfish engine (placeholder implementation included)
- Multiple difficulty levels (beginner to master)
- Configurable thinking time for AI moves
- Move validation and game state management

### Real-time Features
- Placeholder for real-time multiplayer using WebSocket connections
- Live move updates and chat messaging
- Game state synchronization between players

### Game Modes
1. **Computer Mode**: Play against AI with adjustable difficulty
2. **Multiplayer Mode**: Play against other users with real-time updates
3. **Spectate Mode**: Watch ongoing games

## Data Flow

1. **Game Creation**: Client requests new game → Server creates game record → Returns game ID
2. **Move Processing**: Client submits move → Server validates → Updates database → Broadcasts to opponents
3. **AI Moves**: After player move → Server requests AI calculation → AI returns move → Server processes and stores
4. **Real-time Updates**: Database changes trigger WebSocket broadcasts to connected clients
5. **Chat Messages**: Client sends message → Server stores and broadcasts to game participants

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL driver for Neon database
- **drizzle-orm**: Type-safe ORM for database operations
- **chess.js**: Chess game logic and move validation
- **react-chessboard**: Interactive chess board component
- **@tanstack/react-query**: Server state management
- **@radix-ui/***: Accessible UI component primitives

### Development Tools
- **Vite**: Build tool and development server
- **TypeScript**: Type safety and enhanced development experience
- **Tailwind CSS**: Utility-first CSS framework
- **ESBuild**: Fast JavaScript/TypeScript bundler

### Placeholder Integrations
- **Stockfish.js**: Chess AI engine (implementation placeholder)
- **Supabase**: Real-time subscriptions (configuration placeholder)

## Deployment Strategy

### Development
- Vite development server with hot module replacement
- Express server with middleware integration
- Environment variables for database configuration
- Real-time error overlay for debugging

### Production Build
1. **Frontend**: Vite builds React app to `dist/public`
2. **Backend**: ESBuild bundles Express server to `dist/index.js`
3. **Database**: Drizzle migrations applied via `db:push` command
4. **Static Assets**: Served directly by Express in production

### Environment Configuration
- `DATABASE_URL`: PostgreSQL connection string (required)
- `NODE_ENV`: Environment mode (development/production)
- Development mode enables additional debugging and Replit integration

The application is designed to be deployed on platforms like Replit, with automatic database provisioning and streamlined development workflow.
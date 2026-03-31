# Casino Card Game - Replit Configuration

## Overview

This is a multiplayer casino card game application featuring a React frontend and Express backend. The game simulates a casino environment where players join tables, exchange money for gold/silver bars, and play card games with a virtual dealer named "Lady Victoria."

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: React hooks with custom state management for game state
- **UI Framework**: Shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom casino theme colors and animations
- **Build Tool**: Vite for fast development and optimized builds

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **WebSocket**: Real-time communication using native WebSocket implementation
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Session Management**: Connect-pg-simple for PostgreSQL-backed sessions
- **Development**: Hot reloading with Vite middleware integration

## Key Components

### Database Schema (Drizzle ORM)
- **users**: Player accounts with balance, wins, and earnings tracking
- **game_rooms**: Game sessions with room codes, player limits, and game state
- **game_players**: Player positions in games with cards, bars, and status
- **chat_messages**: In-game chat system with different message types

### Game Services
- **GameService**: Core game logic for starting games, dealing cards, and managing turns
- **WebSocketService**: Real-time communication for multiplayer interactions
- **Storage**: Abstracted data layer with in-memory implementation for development

### Frontend Components
- **CasinoTable**: Main game interface with player positions and game state
- **LadyDealer**: Virtual dealer component with voice/animation features
- **MoneyExchange**: System for converting real money to game bars
- **ChatSystem**: Real-time chat with emotes and system messages
- **PlayerPosition**: Individual player display with cards and bars

## Data Flow

1. **Authentication**: Players register/login with username/password
2. **Room Creation**: Host creates game room with unique code
3. **Player Joining**: Players join using room codes
4. **Money Exchange**: Players convert balance to gold/silver bars
5. **Game Start**: Dealer distributes cards when minimum players present
6. **Turn-based Play**: Players take turns playing cards
7. **Win Determination**: Highest card wins the pot of bars
8. **Real-time Updates**: All game state changes broadcast via WebSocket

## External Dependencies

### Production Dependencies
- **@neondatabase/serverless**: Neon PostgreSQL serverless driver
- **@tanstack/react-query**: Server state management for React
- **drizzle-orm**: Type-safe SQL query builder
- **@radix-ui/***: Headless UI component primitives
- **wouter**: Lightweight React router
- **ws**: WebSocket implementation for real-time features

### Development Tools
- **Vite**: Build tool with HMR and optimization
- **TypeScript**: Type safety across frontend and backend
- **Tailwind CSS**: Utility-first CSS framework
- **ESBuild**: Fast JavaScript bundling for production

## Deployment Strategy

### Development Environment
- **Server**: Express with Vite middleware for HMR
- **Database**: PostgreSQL with Drizzle migrations
- **WebSocket**: Integrated with HTTP server
- **Hot Reload**: Vite handles frontend, tsx for backend watching

### Production Build
- **Frontend**: Vite builds to `dist/public` directory
- **Backend**: ESBuild bundles server to `dist/index.js`
- **Database**: Drizzle migrations applied via `db:push` script
- **Static Serving**: Express serves built frontend assets

### Environment Configuration
- **DATABASE_URL**: PostgreSQL connection string (required)
- **NODE_ENV**: Environment mode (development/production)
- **Replit Integration**: Special handling for Replit development environment

The application uses a monorepo structure with shared TypeScript types between frontend and backend, ensuring type safety across the full stack. The casino theme is implemented with custom CSS variables and Tailwind extensions for authentic casino styling.
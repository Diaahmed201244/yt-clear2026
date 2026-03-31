# Survive the Trials - Squid Game Browser Game

## Overview

This is a complete browser-based survival game inspired by Squid Game, called "Survive the Trials". The application is built as a full-stack web game where players must complete 5 dangerous mini-games, with each stage eliminating players until only survivors remain.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Routing**: Wouter for lightweight client-side routing
- **Styling**: Tailwind CSS with custom Squid Game-themed color palette
- **UI Components**: Radix UI primitives with shadcn/ui component library
- **Animations**: GSAP (GreenSock Animation Platform) for smooth game animations
- **State Management**: React hooks with custom game state management
- **Data Fetching**: TanStack React Query for server state management

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API with JSON responses
- **Session Management**: Express sessions with PostgreSQL session store
- **Development**: Hot module replacement with Vite integration

### Data Storage Solutions
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **Schema Management**: Drizzle Kit for migrations and schema generation
- **In-Memory Storage**: Fallback memory storage implementation for development

### Game Engine Architecture
- **Canvas Rendering**: HTML5 Canvas for game graphics and interactions
- **Game States**: Centralized game state management with React hooks
- **AI Simulation**: Simulated AI players for single-player experience
- **Audio System**: Custom audio manager for background music and sound effects

## Key Components

### Game Stages
1. **Red Light, Green Light** - Movement-based timing game with AI elimination simulation
2. **Honeycomb Carve** - Precision tracing game with mouse/touch input and perfectionist challenges
3. **Tug of War** - Click-based strength competition with team dynamics
4. **Marbles** - Probability-based guessing game with AI betting patterns
5. **Glass Bridge** - Risk-based path selection game with multiple difficulty levels
6. **Nightmare Chase** - Escape adventure game with real-time chaser AI, collectibles, and power-up integration

### Adventure Systems
- **Power-Up Shop** - In-game marketplace with 6 different power-ups across 4 rarity tiers
- **Achievement System** - 6 unique achievements with token rewards and progress tracking
- **Special Challenges** - Time-limited challenges with daily resets and bonus rewards
- **Game Modes** - Normal, Hardcore, Blitz, and Endless Survival with unique mechanics

### Core Systems
- **Player Management**: Track player progress, tokens, elimination status, and achievements
- **Game State Engine**: Manage current stage, player count, game modes, and difficulty scaling
- **Power-Up System**: Active and passive abilities with duration tracking and visual effects
- **Challenge System**: Daily challenges, special objectives, and time-limited events
- **Dynamic Difficulty**: Adjustable elimination rates, timers, and AI behavior based on game mode
- **Leaderboard System**: Track and display top survivors with filtering options
- **Audio Management**: Background music and sound effects with user controls
- **Animation System**: GSAP-powered transitions, particle effects, and visual feedback

### UI Components
- **Game Selection Screen**: Stage selection with preview and elimination rates
- **Game Header**: Real-time display of stage, players alive, and tokens
- **Elimination Screen**: Game over screen with retry options
- **Victory Screen**: Success celebration with rewards
- **Leaderboard**: Global rankings and statistics

## Data Flow

### Game Flow
1. Player starts at game selection screen
2. Selects a stage to play (locked stages unlock progressively)
3. Game engine initializes stage-specific logic and AI players
4. Player completes mini-game with real-time feedback
5. Results determine elimination or progression
6. Game state updates reflect changes in player count and progress
7. Successful completion unlocks next stage or shows victory

### Data Persistence
- Player progress saved to PostgreSQL database
- Game sessions tracked with unique identifiers
- Leaderboard entries automatically created for completed games
- Token system persists across sessions

## External Dependencies

### Development Tools
- **Vite**: Build tool and development server with HMR
- **TypeScript**: Type safety and development experience
- **ESBuild**: Fast bundling for production builds

### Runtime Dependencies
- **Express**: Web framework for API routes
- **Drizzle ORM**: Type-safe database operations
- **React Query**: Server state and caching
- **GSAP**: Professional animation library
- **Radix UI**: Accessible component primitives

### Database
- **PostgreSQL**: Primary database (Neon serverless)
- **Connection Pooling**: Built-in with Neon serverless driver
- **Session Storage**: PostgreSQL-backed session store

## Deployment Strategy

### Build Process
- **Client Build**: Vite bundles React application to `dist/public`
- **Server Build**: ESBuild packages Express server to `dist/index.js`
- **Type Checking**: TypeScript compilation verification
- **Database Migration**: Drizzle push commands for schema updates

### Environment Configuration
- **Development**: Hot reload with Vite dev server proxy
- **Production**: Static file serving with Express
- **Database**: Environment variable-based connection string
- **Replit Integration**: Special handling for Replit environment

### Key Features
- **Progressive Web App**: Responsive design for mobile and desktop
- **Real-time Updates**: Live player count and game state updates
- **Accessibility**: ARIA labels and keyboard navigation support
- **Performance**: Optimized animations and efficient rendering
- **Error Handling**: Comprehensive error boundaries and fallbacks

The application uses a monorepo structure with shared types and utilities between client and server, ensuring type safety across the full stack. The game engine is designed to be extensible for adding new mini-games while maintaining consistent player experience and data flow.
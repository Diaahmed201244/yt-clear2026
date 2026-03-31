# Casino Royale - Online Gaming Platform

## Overview

This is a full-stack casino gaming application built with React, Express, and PostgreSQL. The application features a modern web-based casino with multiple games including slots, dice, and crash games. It uses a premium UI design with neon effects and casino-themed styling.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and production builds
- **Styling**: Tailwind CSS with custom casino-themed design system
- **State Management**: Zustand for client-side state (auth, casino, audio, game states)
- **UI Components**: Radix UI primitives with custom styling
- **3D Graphics**: React Three Fiber for potential 3D game elements
- **Audio**: Custom audio management system for background music and sound effects

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Runtime**: Node.js with ES modules
- **Development**: Hot reload with Vite integration
- **API**: RESTful endpoints with `/api` prefix
- **Session Management**: In-memory storage (development) with planned database integration

### Data Storage
- **Database**: PostgreSQL with Drizzle ORM
- **Schema**: User management with username/password authentication
- **Migrations**: Drizzle Kit for database schema management
- **Development Storage**: In-memory storage for rapid prototyping
- **Connection**: Neon Database serverless PostgreSQL

## Key Components

### Authentication System
- **Registration/Login**: Modal-based authentication flow
- **User Management**: Persistent user sessions with balance tracking
- **Storage**: Local storage for development, database-backed for production

### Game Engine
- **Game Types**: Slots, Dice, and Crash games with different mechanics
- **Balance Management**: Real-time balance updates with transaction tracking
- **Game History**: Persistent game result tracking with win/loss records
- **Audio System**: Background music and sound effects with mute controls

### UI/UX Design
- **Theme**: Dark casino theme with neon green accents
- **Typography**: Orbitron font for futuristic casino aesthetic
- **Components**: Modular UI components with consistent styling
- **Responsive**: Mobile-first design with adaptive layouts

### Game Logic
- **Slots**: 3x3 grid with symbol matching and multiplier system
- **Dice**: High/low prediction game with configurable payouts
- **Crash**: Real-time multiplier game with cash-out mechanics
- **RNG**: Client-side random number generation for game outcomes

## Data Flow

1. **User Authentication**: Login/register → local storage → app state
2. **Game Selection**: Navigation → game state management → UI updates
3. **Game Play**: User input → game logic → balance updates → history tracking
4. **Audio Management**: User preferences → audio state → sound playback

## External Dependencies

### Database
- **Neon Database**: Serverless PostgreSQL for production
- **Drizzle ORM**: Type-safe database queries and migrations
- **Environment**: `DATABASE_URL` required for database connection

### UI Libraries
- **Radix UI**: Accessible component primitives
- **Tailwind CSS**: Utility-first styling framework
- **Lucide React**: Icon library for UI elements
- **React Query**: Server state management (prepared for API integration)

### Development Tools
- **Vite**: Development server and build tool with HMR
- **TypeScript**: Type safety across frontend and backend
- **ESBuild**: Fast JavaScript/TypeScript compilation

## Deployment Strategy

### Development
- **Frontend**: Vite dev server with hot module replacement
- **Backend**: Express server with TypeScript compilation via tsx
- **Database**: Local development with optional PostgreSQL

### Production
- **Build Process**: 
  1. Vite builds frontend to `dist/public`
  2. ESBuild compiles backend to `dist/index.js`
- **Deployment**: Single process serving both static files and API
- **Database**: Neon Database with connection pooling

### Environment Variables
- `DATABASE_URL`: PostgreSQL connection string
- `NODE_ENV`: Environment detection for development/production modes

### Scaling Considerations
- In-memory storage replaced with database persistence
- Session management with database-backed sessions
- Asset optimization for casino graphics and audio files
- CDN integration for static assets
# replit.md

## Overview

This is a multiplayer casino card game built with a modern full-stack architecture. The application features real-time gameplay with WebSocket communication, voice chat capabilities using WebRTC, and a casino-themed user interface. Players can create or join game rooms, exchange money for betting bars, and participate in turn-based card games with integrated chat functionality.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The client side is built using **React 18** with **TypeScript** and styled with **Tailwind CSS**. The application uses:
- **Vite** as the build tool and development server
- **Wouter** for client-side routing (lightweight alternative to React Router)
- **TanStack Query (React Query)** for server state management and API caching
- **shadcn/ui** component library for consistent UI components
- **Radix UI** primitives for accessible component foundations

### Backend Architecture
The server uses **Express.js** with **TypeScript** running on **Node.js**:
- WebSocket server integration for real-time communication
- RESTful API endpoints for game management
- Session-based authentication (temporary implementation)
- In-memory storage with plans for PostgreSQL migration

### Database Strategy
Currently implements **in-memory storage** for development, with Drizzle ORM configuration ready for **PostgreSQL** migration:
- Drizzle ORM with Zod validation schemas
- Database schema defined in shared module
- Migration support through drizzle-kit
- Neon Database serverless driver ready for deployment

## Key Components

### Real-time Communication
- **WebSocket** server handles game state synchronization, player actions, and chat messages
- **WebRTC** integration for peer-to-peer voice communication during gameplay
- Audio device management and settings for voice chat quality control

### Game Logic
- Turn-based card game mechanics with betting system using gold/silver bars
- Room-based multiplayer sessions supporting up to 6 players
- Game state management with current player tracking and round progression

### User Interface
- **Casino-themed design** with custom CSS variables for consistent theming
- Responsive layout supporting desktop and mobile devices
- Real-time chat system with emotes and system messages
- Audio visualization and communication controls

### Security & Authentication
- Basic username/password authentication for demo purposes
- Session management for user persistence
- Input validation using Zod schemas throughout the application

## Data Flow

### Client-Server Communication
1. **HTTP requests** for initial authentication, room creation, and static data
2. **WebSocket messages** for real-time game updates, player actions, and chat
3. **WebRTC peer connections** for direct voice communication between players

### State Management
- **Client state**: React hooks for local UI state, TanStack Query for server state caching
- **Server state**: In-memory storage with structured data models for users, rooms, players, and messages
- **Game state**: Centralized game logic with state broadcasting to all room participants

### Data Persistence
- User accounts and balances stored server-side
- Game sessions persist during active gameplay
- Chat history maintained per room session
- Player preferences saved locally (audio settings, UI preferences)

## External Dependencies

### Frontend Dependencies
- **React ecosystem**: React 18, React DOM, React Hook Form
- **UI libraries**: Radix UI primitives, Lucide icons, Tailwind CSS
- **State management**: TanStack Query for server state
- **Development tools**: Vite, TypeScript, ESLint integration

### Backend Dependencies
- **Server framework**: Express.js with WebSocket support
- **Database**: Drizzle ORM, @neondatabase/serverless driver
- **Development**: tsx for TypeScript execution, esbuild for production builds

### Audio/Video
- **Native Web APIs**: WebRTC for peer-to-peer communication, Web Audio API for sound effects
- **Device management**: MediaDevices API for microphone/speaker selection

## Deployment Strategy

### Development Environment
- **Vite dev server** with hot module replacement for frontend development
- **tsx** for running TypeScript server code with auto-reload
- **Concurrent development** setup allowing both client and server development

### Production Build
- **Vite build** outputs optimized client assets to `dist/public`
- **esbuild** bundles server code to `dist/index.js` for Node.js execution
- **Static file serving** through Express for the built client application

### Database Migration
- **Drizzle migrations** ready for PostgreSQL deployment
- **Environment variable** configuration for database URL
- **Neon Database** serverless PostgreSQL for production scaling

### Hosting Considerations
- **WebSocket support** required for real-time functionality
- **HTTPS/WSS** needed for WebRTC functionality in production
- **Session storage** will need external solution (Redis) for multi-instance deployment
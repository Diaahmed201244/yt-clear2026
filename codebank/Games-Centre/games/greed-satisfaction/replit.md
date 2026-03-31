# Replit.md

## Overview

This is a full-stack web application built with React, Express, and PostgreSQL using a modern tech stack. "Greed or Satisfaction" is a thrilling risk-vs-reward mystery box game where players pay codes to open boxes containing various outcomes including rewards, jackpots, multipliers, bombs, knives (that cut balance in half), thieves, and curses. The application features impressive sound effects, animations, and visual feedback to create an engaging gambling-style experience.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

The application follows a full-stack monorepo architecture with the following key decisions:

### Frontend Architecture
- **React with TypeScript**: Chosen for type safety and modern development experience
- **Vite**: Selected as the build tool for fast development and optimized production builds
- **shadcn/ui**: Provides a comprehensive component library built on Radix UI primitives
- **TailwindCSS**: Used for utility-first styling with custom CSS variables for theming
- **Wouter**: Lightweight client-side routing library instead of React Router
- **TanStack Query**: Handles server state management and API interactions

### Backend Architecture
- **Express.js**: RESTful API server with TypeScript support
- **Node.js with ESM**: Modern JavaScript modules for better tree-shaking and performance
- **In-memory storage**: Currently uses a simple Map-based storage system for development

### Database Strategy
- **Drizzle ORM**: Type-safe database interactions with PostgreSQL
- **PostgreSQL**: Production database with players table for daily limit tracking
- **Schema-first approach**: Shared TypeScript types generated from database schema
- **Daily Limit Enforcement**: Server-side validation preventing multiple plays per day

### State Management
- **Local Storage**: Persists game state and user preferences
- **React hooks**: Custom hooks for game logic and state management
- **TanStack Query**: Server state caching and synchronization

## Key Components

### Game Logic
- **Game State Management**: Custom hook (`useGameState`) handles all game mechanics with 8 different outcome types
- **Single Balance System**: Simplified to use only total codes - all gains/losses directly affect this balance
- **Box Outcomes**: Advanced probability system featuring rewards, jackpots (800-1500), multipliers (2x-5x), bombs, knives (cut balance 50%), thieves (steal codes), curses, elixirs (restore lost balance), and shields (10s protection)  
- **Dynamic Risk System**: Greed level increases bomb and knife chances as players continue
- **Daily Play Limit**: Players can only start one game session per day, enforced through PostgreSQL database tracking
- **Local Persistence**: Game progress and statistics saved locally with daily reset logic
- **Audio System**: Procedural sound generation for different outcomes (explosions, slicing, fanfares, etc.)
- **Enhanced Animations**: Box-specific animations including explosions, sparkles, slicing, and curse effects
- **Cinematic Balance Effects**: Fire spreads and burns balance to zero, knife slices balance showing the split, elixir restores with healing glow
- **Protective Shield System**: 10-second timer with visual countdown, particle effects, and damage immunity
- **Streamlined Continue**: Continue button directly deducts 1 code and starts new round without intermediate screens

### UI Components
- **GameBox**: Interactive mystery box component with flip animations and outcome-specific effects
- **ConfettiEffect**: Celebration animation for big wins
- **BalanceAnimations**: Dramatic balance-affecting animations (fire burning, knife slicing, elixir healing)
- **ShieldEffect**: Protective barrier with countdown timer and orbiting particles
- **ParticleEffect**: Outcome-specific particle systems for enhanced visual feedback
- **shadcn/ui components**: Comprehensive UI component library

### Backend Services
- **PlayerService**: Manages daily play limits with PostgreSQL persistence
- **Database Integration**: PostgreSQL with Drizzle ORM for player tracking
- **Storage Interface**: Abstracted storage layer supporting both in-memory and database backends
- **Route Registration**: Modular route system for API endpoints including player endpoints
- **Error Handling**: Centralized error handling middleware

## Data Flow

1. **Client-side game state** managed through React hooks and local storage
2. **API requests** handled via TanStack Query with automatic caching
3. **Type safety** ensured through shared schema between client and server
4. **Real-time feedback** provided through toast notifications and animations

## External Dependencies

### UI and Styling
- **Radix UI**: Headless UI components for accessibility
- **Lucide React**: Icon library
- **TailwindCSS**: Utility-first CSS framework
- **class-variance-authority**: Component variant management

### Backend Services
- **Neon Database**: Serverless PostgreSQL hosting
- **Drizzle Kit**: Database migrations and schema management

### Development Tools
- **Vite**: Build tool and development server
- **TypeScript**: Type safety across the entire stack
- **ESLint**: Code linting and formatting

## Deployment Strategy

### Development
- **Vite dev server**: Hot module replacement for client-side development
- **Express server**: API development with automatic restart via tsx
- **Replit integration**: Specific plugins for Replit environment

### Production
- **Static build**: Vite builds optimized client bundle
- **Node.js server**: Express serves both API and static files
- **Database migrations**: Drizzle Kit handles schema updates
- **Environment variables**: Database URL and other config via environment

### Key Architectural Decisions

1. **Monorepo structure**: Enables shared types and easier development workflow
2. **TypeScript everywhere**: Ensures type safety from database to UI
3. **Serverless database**: Reduces infrastructure complexity with Neon
4. **Component-first UI**: shadcn/ui provides consistent, accessible components
5. **Local-first game state**: Reduces server load and improves user experience
6. **Abstract storage layer**: Allows easy switching between in-memory and database storage

The application is designed to be easily extensible, with clear separation of concerns and modern development practices throughout the stack.
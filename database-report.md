# Database Schema Report

## Overview

This report documents the complete database schema for the YouTube Clear application, including both SQLite (local) and Turso (cloud) database configurations. The application uses a dual-database approach with automatic fallback from Turso to SQLite.

## Database Configuration

### Environment Variables

```bash
# Turso Configuration (Primary)
TURSO_URL=https://your-db.turso.io
TURSO_TOKEN=your-auth-token
TURSO_DATABASE_URL=https://your-db.turso.io  # Alternative name
TURSO_AUTH_TOKEN=your-auth-token             # Alternative name

# SQLite Configuration (Fallback)
DATABASE_URL=sqlite:///path/to/database.sqlite
SQLITE_DB_PATH=/path/to/database.sqlite
```

### Connection Logic

The application automatically detects and connects to the appropriate database:

1. **Turso (Primary)**: Uses `@libsql/client/http` for HTTP-based connections
2. **SQLite (Fallback)**: Uses `better-sqlite3` for local file-based storage
3. **Mock Database**: Used when neither database is available

## Database Schema

### Core Tables (SQLite & Turso Compatible)

#### 1. Users Table
```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE,
  username TEXT UNIQUE,
  user_type TEXT DEFAULT 'user',
  password_hash TEXT,
  codes_count INT DEFAULT 0,
  silver_count INT DEFAULT 0,
  gold_count INT DEFAULT 0,
  religion TEXT,
  country TEXT,
  phone TEXT,
  last_sync_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_sync_hash TEXT,
  is_untrusted BOOLEAN DEFAULT 0,
  flagged_reason TEXT
);
```

**Purpose**: Main user authentication and profile information
**Key Features**:
- UUID-based primary key
- Password hashing for security
- Asset counts for codes, silver, and gold
- Profile fields for religion, country, phone

#### 2. Ledger Table
```sql
CREATE TABLE ledger (
  id TEXT PRIMARY KEY,
  tx_id TEXT NOT NULL,
  tx_hash TEXT,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  direction TEXT NOT NULL CHECK (direction IN ('debit','credit')),
  asset_type TEXT NOT NULL,
  amount INT NOT NULL CHECK (amount > 0),
  reference TEXT,
  meta TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

**Purpose**: Financial transaction ledger for all asset movements
**Key Features**:
- Immutable transaction records
- Debit/credit direction tracking
- Asset type classification
- Transaction metadata storage

#### 3. Codes Table
```sql
CREATE TABLE codes (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  type TEXT DEFAULT 'normal',
  spent BOOLEAN DEFAULT 0,
  is_compressed BOOLEAN DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**Purpose**: Individual code storage and ownership tracking
**Key Features**:
- Code ownership by user
- Compression tracking for bulk codes
- Spending status tracking

#### 4. Balances Table
```sql
CREATE TABLE balances (
  user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  codes_count INT DEFAULT 0,
  silver_count INT DEFAULT 0,
  gold_count INT DEFAULT 0,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**Purpose**: User asset balance summaries
**Key Features**:
- Real-time balance tracking
- Separate counts for different asset types

#### 5. Qarsan Virtual Users Table
```sql
CREATE TABLE qarsan_virtual_users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE,
  name TEXT,
  dog_state TEXT,
  qarsan_mode TEXT DEFAULT 'OFF',
  balance INT DEFAULT 0,
  qarsan_wallet INT DEFAULT 0,
  last_fed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**Purpose**: Virtual user accounts for the Qarsan game mechanic
**Key Features**:
- Simulated user profiles
- Watch-Dog state tracking
- Qarsan mode and wallet management

#### 6. Event Vault Table
```sql
CREATE TABLE event_vault (
  id TEXT PRIMARY KEY,
  event_type TEXT NOT NULL,
  version TEXT NOT NULL DEFAULT '1.0',
  actor_user_id TEXT,
  target_user_id TEXT,
  amount NUMERIC,
  asset_id TEXT,
  metadata TEXT,
  status TEXT NOT NULL DEFAULT 'success',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  tx_hash TEXT UNIQUE
);
```

**Purpose**: Event sourcing for audit trails and replayability
**Key Features**:
- Immutable event storage
- Version tracking for schema evolution
- Actor and target user tracking

#### 7. Sync Events Table
```sql
CREATE TABLE sync_events (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  delta_codes INT DEFAULT 0,
  delta_silver INT DEFAULT 0,
  delta_gold INT DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**Purpose**: Client-server synchronization tracking
**Key Features**:
- Delta-based synchronization
- Idempotency for network reliability

#### 8. Used Codes Table
```sql
CREATE TABLE used_codes (
  code_hash TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  used_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**Purpose**: Prevents double-spending of codes
**Key Features**:
- SHA256 hash-based deduplication
- User-specific code usage tracking

#### 9. User Assets Table
```sql
CREATE TABLE user_assets (
  user_id TEXT NOT NULL,
  asset_id TEXT NOT NULL,
  PRIMARY KEY(user_id, asset_id)
);
```

**Purpose**: Many-to-many relationship between users and assets
**Key Features**:
- Composite primary key
- Asset ownership tracking

#### 10. Auth Sessions Table
```sql
CREATE TABLE auth_sessions (
  token TEXT PRIMARY KEY,
  token_hash TEXT,
  user_id TEXT NOT NULL,
  expires_at DATETIME NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**Purpose**: Session management for authentication
**Key Features**:
- Token-based authentication
- Expiration tracking
- Hash-based security

### PostgreSQL/Turso Extended Schema

The `api/sql/schema.sql` file contains the full PostgreSQL-compatible schema with additional features:

#### Extended User Tables
- `users` - Core user information
- `users_profiles` - Extended profile data
- `auth_sessions` - JWT session management
- `roles` - Role-based access control
- `user_roles` - User-role relationships

#### Asset Management Tables
- `wallets` - Traditional wallet system
- `setta_wallets` - Setta-specific wallet
- `transactions` - General transaction history
- `setta_transactions` - Setta-specific transactions

#### Media and Content Tables
- `farragna_videos` - Video content management
- `farragna_comments` - Video comments
- `farragna_likes` - Video like system
- `farragna_follows` - Social following
- `farragna_views` - View tracking
- `shots` - Photo content
- `shots_photos` - Photo storage

#### Communication Tables
- `chats` - Chat room management
- `chat_members` - Chat membership
- `messages` - Message storage
- `e7ki_message_reactions` - Message reactions
- `e7ki_message_reads` - Read receipts
- `e7ki_typing_indicators` - Typing status
- `e7ki_presence` - User presence

#### Game and Reward Tables
- `games` - Game definitions
- `game_scores` - Score tracking
- `corsa_codes` - Corsa-specific codes
- `corsa_transactions` - Corsa transactions
- `rewards` - Reward system

#### Nostaglia Tables
- `nostaglia_uploads` - Memory uploads
- `nostaglia_reactions` - Upload reactions
- `nostaglia_comments` - Upload comments
- `nostaglia_shares` - Share tracking
- `nostaglia_cycles` - Memory cycles

## Database Features

### Transaction Support
- Full ACID compliance
- Automatic transaction batching for performance
- Rollback support for error handling

### Indexing Strategy
- Primary keys on all tables
- Foreign key relationships with CASCADE deletes
- Performance indexes on frequently queried columns

### Security Features
- Password hashing with bcrypt
- JWT token management
- Session expiration
- Input sanitization and parameterized queries

### Performance Optimizations
- WAL (Write-Ahead Logging) mode for SQLite
- Connection pooling
- Query optimization
- Batch operations for bulk data

### Data Integrity
- Foreign key constraints
- Check constraints for data validation
- Unique constraints for preventing duplicates
- NOT NULL constraints for required fields

## Migration Strategy

### Schema Evolution
The application uses a DDL (Data Definition Language) approach for schema management:

1. **Automatic Schema Creation**: Tables are created on first use
2. **Column Addition**: New columns are added via ALTER TABLE statements
3. **Index Creation**: Performance indexes are created as needed
4. **Constraint Updates**: Constraints are updated for data integrity

### Data Migration
- Automatic migration from SQLite to Turso when available
- Data preservation during schema changes
- Backup and restore capabilities

## Backup and Recovery

### Automatic Backups
The system creates automatic backups with timestamped filenames:
- `data.sqlite.bak.20260323_034303`
- `data.sqlite.bak.20260323_042011`

### Manual Backup
```bash
# Create manual backup
sqlite3 data/database.sqlite ".backup data-backup-$(date +%Y%m%d_%H%M%S).sqlite"

# Restore from backup
sqlite3 data/database.sqlite ".restore data-backup-20260323_034303.sqlite"
```

## Monitoring and Maintenance

### Health Checks
- Database connection status
- Table integrity verification
- Performance metrics
- Error logging

### Maintenance Tasks
- Regular backup creation
- Index optimization
- Data cleanup for expired sessions
- Log rotation

## Security Considerations

### Access Control
- Environment variable protection for database credentials
- Limited database user permissions
- Network security for Turso connections

### Data Protection
- Encryption at rest for sensitive data
- Secure password hashing
- Session token security
- Input validation and sanitization

### Audit Trail
- Complete transaction logging
- Event sourcing for critical operations
- User activity tracking
- Security event monitoring

## Conclusion

This database schema provides a robust foundation for the YouTube Clear application with support for both local development (SQLite) and production deployment (Turso). The dual-database approach ensures reliability and performance while maintaining data integrity and security.

The schema is designed to be extensible, allowing for future feature additions while maintaining backward compatibility. Regular monitoring and maintenance ensure optimal performance and data protection.
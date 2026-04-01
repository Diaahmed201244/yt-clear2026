import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../config/db.js';
import { requireAuth } from '../middleware/auth.js';
import multer from 'multer';
import fs from 'fs-extra';
import path from 'path';

// --- DATABASE INIT ---
// Ensure the core E7ki tables exist via the global pool
export const initE7kiTables = async () => {
    try {   
        await query(`
            CREATE TABLE IF NOT EXISTS e7ki_conversations (
                id TEXT PRIMARY KEY,
                participant_ids TEXT NOT NULL,
                title TEXT DEFAULT 'Untitled Chat',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
        `);
        // Index not normally supported perfectly in 'CREATE TABLE IF NOT EXISTS' via Turso without standalone queries safely.
        await query(`CREATE INDEX IF NOT EXISTS idx_conversations_updated ON e7ki_conversations(updated_at DESC);`).catch(() => {});

        await query(`
            CREATE TABLE IF NOT EXISTS e7ki_messages (
                id TEXT PRIMARY KEY,
                chat_id TEXT NOT NULL,
                sender_id TEXT NOT NULL,
                sender_username TEXT,
                content TEXT,
                type TEXT DEFAULT 'text',
                media_url TEXT,
                status TEXT DEFAULT 'sent',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (chat_id) REFERENCES e7ki_conversations(id)
            );
        `);
        await query(`CREATE INDEX IF NOT EXISTS idx_messages_chat ON e7ki_messages(chat_id, created_at DESC);`).catch(() => {});
        await query(`CREATE INDEX IF NOT EXISTS idx_messages_sender ON e7ki_messages(sender_id);`).catch(() => {});

        await query(`
            CREATE TABLE IF NOT EXISTS e7ki_reactions (
                id TEXT PRIMARY KEY,
                message_id TEXT NOT NULL,
                user_id TEXT NOT NULL,
                reaction TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (message_id) REFERENCES e7ki_messages(id) ON DELETE CASCADE,
                UNIQUE(message_id, user_id, reaction)
            );
        `);

        await query(`
            CREATE TABLE IF NOT EXISTS e7ki_media (
                id TEXT PRIMARY KEY,
                message_id TEXT,
                file_path TEXT NOT NULL,
                file_type TEXT,
                file_size INTEGER,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (message_id) REFERENCES e7ki_messages(id) ON DELETE SET NULL
            );
        `);
        console.log('[E7KI] Core tables initialized ✅');
    } catch (e) {
        console.error('[E7KI] Failed to init DB:', e.message);
    }
};

// --- ROUTER ---
const router = express.Router();

// Middleware inside the mounted path
router.use(requireAuth);

router.get('/health', (req, res) => {
    res.json({ status: "ok", service: "e7ki (native)" });
});

router.get('/users', async (req, res) => {
    try {   
        // Query users table (from core CodeBank)
        const users = await query('SELECT id, username, email FROM users WHERE id != $1 LIMIT 100', [req.user.id]);
        res.json(users.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/chats', async (req, res) => {
    try {   
        const chats = await query(`
            SELECT * FROM e7ki_conversations 
            WHERE participant_ids LIKE $1
            ORDER BY updated_at DESC
        `, [`%${req.user.id}%`]);
        
        const formatted = chats.rows.map(r => ({
            ...r,
            participant_ids: JSON.parse(r.participant_ids)
        }));
        
        res.json(formatted);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/chats', async (req, res) => {
    try {   
        const { participantIds, title } = req.body;
        const allParticipants = [req.user.id, ...participantIds];
        const id = uuidv4();
        const pStr = JSON.stringify(allParticipants);
        const chatTitle = title || 'Untitled Chat';

        await query(`
            INSERT INTO e7ki_conversations (id, participant_ids, title, updated_at)
            VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
        `, [id, pStr, chatTitle]);
        
        res.status(201).json({ id, participant_ids: pStr, title: chatTitle, is_group: participantIds.length > 1 });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/chats/:chatId/messages', async (req, res) => {
    try {   
        const limit = parseInt(req.query.limit) || 50;
        const offset = parseInt(req.query.offset) || 0;
        
        const messages = await query(`
            SELECT * FROM e7ki_messages 
            WHERE chat_id = $1
            ORDER BY created_at DESC
            LIMIT $2 OFFSET $3
        `, [req.params.chatId, limit, offset]);
        
        const forward = messages.rows.reverse(); // Reverse back to chronological order
        res.json(forward);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Used exclusively for explicit send outside WS or for REST
router.post('/messages', async (req, res) => {
    try {   
        const id = uuidv4();
        const { chatId, content, type, mediaUrl, status } = req.body;
        const msgType = type || 'text';
        const msgStatus = status || 'sent';
        const senderUsername = req.user.username || req.user.email.split('@')[0];

        await query(`
            INSERT INTO e7ki_messages (id, chat_id, sender_id, sender_username, content, type, media_url, status)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `, [id, chatId, req.user.id, senderUsername, content, msgType, mediaUrl || null, msgStatus]);

        await query(`UPDATE e7ki_conversations SET updated_at = CURRENT_TIMESTAMP WHERE id = $1`, [chatId]);

        const messageData = { id, chat_id: chatId, sender_id: req.user.id, sender_username: senderUsername, content, type: msgType, media_url: mediaUrl, status: msgStatus, created_at: new Date().toISOString() };
        
        // Let main WS orchestrator know
        if (global.e7kiBroadcast) {
            global.e7kiBroadcast(chatId, 'new-message', messageData);
        }

        res.status(201).json(messageData);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/messages/:id/read', async (req, res) => {
    try {   
        await query(`UPDATE e7ki_messages SET status = $1 WHERE id = $2`, ['read', req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// -- FILE UPLOAD --
const uploadDir = path.join(process.cwd(), 'uploads', 'e7ki');
fs.ensureDirSync(uploadDir);

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const userDir = path.join(uploadDir, req.user.id);
        fs.ensureDirSync(userDir);
        cb(null, userDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 100 * 1024 * 1024 } // 100MB
});

router.post('/upload', upload.single('file'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const publicUrl = `/uploads/e7ki/${req.user.id}/${req.file.filename}`;
    res.json({ 
        success: true,
        url: publicUrl,
        type: req.file.mimetype,
        filename: req.file.originalname,
        size: req.file.size
    });
});

export default router;

// --- SOCKET ORCHESTRATOR ---
export const registerE7kiSockets = (io) => {
    console.log('[E7KI] Mounting Socket.IO handlers to global WS');
    
    // Create a broadcast helper available globally
    global.e7kiBroadcast = (chatId, event, payload) => {
        io.to(`e7ki_chat_${chatId}`).emit(event, payload);
    };

    io.on('connection', (socket) => {
        // Only allow E7ki events if authenticated. We rely on initial WS auth if it exists
        // but since they already connected, we can attach loose handlers
        socket.on('join-chat', (chatId) => {
             // In CodeBank, we store user session on socket.user (or passed via query)
             // fallback to socket payload
             socket.join(`e7ki_chat_${chatId}`);
             console.log(`[E7ki] User joined chat ${chatId}`);
             // To properly broadcast, the client should send their userId
             socket.to(`e7ki_chat_${chatId}`).emit('user-presence', { status: 'online' });
        });

        socket.on('typing', ({ chatId, isTyping, userId, username }) => {
            socket.to(`e7ki_chat_${chatId}`).emit('user-typing', { 
                userId, 
                username,
                isTyping 
            });
        });

        // We can manually handle chat messages through WebSocket too:
        socket.on('send-message', async (msgPayload) => {
              // Usually handled by REST but if they want pure WS:
        });
    });
};

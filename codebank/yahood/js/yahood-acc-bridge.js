class YahoodACCBridge {
    constructor() {
        this.parent = window.parent;
        this.messageQueue = [];
        this.ready = false;
        this.balance = { codes: 0, silver: 0, gold: 0 };
        this.user = null;
        this.socketEvents = {};
        
        this.init();
    }
    
    init() {
        window.addEventListener('message', (e) => {
            this.handleParentMessage(e.data);
        });
        
        this.sendToParent('yahood:service:ready', { version: '1.0.0' });
        this.ready = true;
        
        this.requestUserInfo();
        this.requestBalance();
    }
    
    handleParentMessage(data) {
        const { type, event, ...payload } = data;
        
        switch(type) {
            case 'acc:transaction:response':
                this.handleTransactionResponse(payload);
                break;
                
            case 'acc:balance:response':
                this.balance = payload.balance;
                this.emit('balanceUpdated', this.balance);
                break;
                
            case 'auth:user:response':
                this.user = payload.user;
                this.emit('userUpdated', this.user);
                break;
                
            case 'yahood:socket:event':
                // Real-time event from server via parent
                this.emit(payload.event, payload.data);
                break;
        }
    }
    
    sendToParent(type, data) {
        this.parent.postMessage({ type, data }, '*');
    }
    
    // Socket.io via parent relay
    emitSocket(event, payload) {
        this.sendToParent('yahood:socket:emit', { event, payload });
    }
    
    onSocket(event, callback) {
        this.on(event, callback);
    }
    
    // ACC API
    requestUserInfo() {
        this.sendToParent('yahood:auth:getUser', {});
    }
    
    requestBalance() {
        this.sendToParent('yahood:acc:getBalance', {});
    }
    
    async addTreasure(assetType, amount, reason = 'Mining') {
        return new Promise((resolve) => {
            const txId = Date.now() + Math.random();
            
            this.sendToParent('yahood:acc:transaction', {
                assetType,
                amount,
                action: 'add',
                reason,
                txId
            });
            
            const handler = (e) => {
                if (e.data?.type === 'acc:transaction:response' && 
                    e.data?.data?.txId === txId) {
                    window.removeEventListener('message', handler);
                    resolve(e.data.data);
                }
            };
            window.addEventListener('message', handler);
        });
    }
    
    async deductForPurchase(assetType, amount, reason) {
        return new Promise((resolve) => {
            this.sendToParent('yahood:acc:transaction', {
                assetType,
                amount,
                action: 'deduct',
                reason,
                txId: Date.now() + Math.random()
            });
            
            const handler = (e) => {
                if (e.data?.type === 'acc:transaction:response') {
                    window.removeEventListener('message', handler);
                    resolve(e.data.data);
                }
            };
            window.addEventListener('message', handler);
        });
    }
    
    // Event emitter
    listeners = {};
    on(event, callback) {
        if (!this.listeners[event]) this.listeners[event] = [];
        this.listeners[event].push(callback);
    }
    emit(event, data) {
        this.listeners[event]?.forEach(cb => cb(data));
    }

    handleTransactionResponse(payload) {
        // Implementation for handleTransactionResponse
        console.log('[YahoodBridge] Transaction response:', payload);
    }
}

window.YahoodBridge = new YahoodACCBridge();

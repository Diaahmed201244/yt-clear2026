"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ChatSystem;
const react_1 = require("react");
const card_1 = require("@/components/ui/card");
const button_1 = require("@/components/ui/button");
const input_1 = require("@/components/ui/input");
const lucide_react_1 = require("lucide-react");
const utils_1 = require("@/lib/utils");
function ChatSystem({ messages, onSendMessage }) {
    const [message, setMessage] = (0, react_1.useState)("");
    const messagesEndRef = (0, react_1.useRef)(null);
    const scrollToBottom = () => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({
                behavior: "smooth",
                block: "nearest",
                inline: "nearest"
            });
        }
    };
    (0, react_1.useEffect)(() => {
        // Disable auto-scroll completely to prevent page interference
        // Users can manually scroll in chat if needed
    }, [messages]);
    const handleSendMessage = () => {
        if (message.trim()) {
            onSendMessage(message.trim());
            setMessage("");
        }
    };
    const handleKeyPress = (e) => {
        if (e.key === "Enter") {
            handleSendMessage();
        }
    };
    const handleEmote = (emote) => {
        onSendMessage(emote, "emote");
    };
    const formatTime = (timestamp) => {
        const date = typeof timestamp === "string" ? new Date(timestamp) : timestamp;
        return date.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit"
        });
    };
    return (<card_1.Card className="bg-black/80 border-casino-gold/30 backdrop-blur-sm overflow-hidden chat-system">
      <card_1.CardHeader className="bg-casino-red/80 border-b border-casino-gold/30 py-3">
        <card_1.CardTitle className="text-casino-cream font-semibold flex items-center text-base">
          <lucide_react_1.MessageCircle className="h-4 w-4 mr-2"/>
          Table Chat
        </card_1.CardTitle>
      </card_1.CardHeader>
      
      <card_1.CardContent className="p-0">
        {/* Messages Area */}
        <div className="h-64 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 ? (<div className="text-casino-cream/60 text-center text-sm italic">
              No messages yet. Start the conversation!
            </div>) : (messages.map((msg) => {
            var _a, _b;
            return (<div key={msg.id} className="flex items-start space-x-2">
                {msg.messageType === "system" ? (<div className="text-casino-gold text-sm italic w-full text-center">
                    {msg.message}
                  </div>) : (<>
                    <div className="w-6 h-6 rounded-full bg-casino-gold text-black text-xs flex items-center justify-center flex-shrink-0">
                      {((_b = (_a = msg.playerName) === null || _a === void 0 ? void 0 : _a.charAt(0)) === null || _b === void 0 ? void 0 : _b.toUpperCase()) || "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="text-casino-gold font-semibold text-sm">
                          {msg.playerName}:
                        </span>
                        <span className="text-casino-cream/60 text-xs">
                          {msg.timestamp && formatTime(msg.timestamp)}
                        </span>
                      </div>
                      <div className={(0, utils_1.cn)("text-casino-cream text-sm mt-1", msg.messageType === "emote" && "text-2xl")}>
                        {msg.message}
                      </div>
                    </div>
                  </>)}
              </div>);
        }))}
          <div ref={messagesEndRef}/>
        </div>
        
        {/* Input Area */}
        <div className="p-4 border-t border-casino-gold/30">
          <div className="flex space-x-2 mb-3">
            <input_1.Input value={message} onChange={(e) => setMessage(e.target.value)} onKeyPress={handleKeyPress} placeholder="Type a message..." className="flex-1 bg-gray-900 border-casino-gold/30 text-casino-cream text-sm focus:border-casino-gold" maxLength={200}/>
            <button_1.Button onClick={handleSendMessage} disabled={!message.trim()} size="sm" className="bg-casino-gold text-black hover:bg-yellow-400">
              <lucide_react_1.Send className="h-4 w-4"/>
            </button_1.Button>
          </div>
          
          {/* Quick Emotes */}
          <div className="flex space-x-2">
            {["👍", "😄", "🎉", "🤔", "😮", "💯"].map((emote) => (<button key={emote} onClick={() => handleEmote(emote)} className="bg-gray-800 hover:bg-gray-700 text-casino-cream px-2 py-1 rounded text-sm transition-colors">
                {emote}
              </button>))}
          </div>
        </div>
      </card_1.CardContent>
    </card_1.Card>);
}

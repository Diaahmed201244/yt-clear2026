"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ChatSystem;
const react_1 = require("react");
const card_1 = require("@/components/ui/card");
const button_1 = require("@/components/ui/button");
const input_1 = require("@/components/ui/input");
const lucide_react_1 = require("lucide-react");
function ChatSystem({ messages, onSendMessage }) {
    const [chatMessage, setChatMessage] = (0, react_1.useState)("");
    const messagesEndRef = (0, react_1.useRef)(null);
    const scrollToBottom = () => {
        var _a;
        (_a = messagesEndRef.current) === null || _a === void 0 ? void 0 : _a.scrollIntoView({ behavior: "auto" });
    };
    (0, react_1.useEffect)(() => {
        scrollToBottom();
    }, [messages]);
    const handleSendMessage = () => {
        if (!chatMessage.trim())
            return;
        onSendMessage(chatMessage.trim(), "chat");
        setChatMessage("");
    };
    const handleSendEmote = (emote) => {
        onSendMessage(emote, "emote");
    };
    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSendMessage();
        }
    };
    const formatTime = (timestamp) => {
        if (!timestamp)
            return "";
        return new Date(timestamp).toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
        });
    };
    return (<card_1.Card className="bg-black/80 border-casino-gold/30 backdrop-blur-sm chat-system">
      <card_1.CardHeader className="pb-3">
        <card_1.CardTitle className="text-casino-cream font-semibold flex items-center text-base">
          <lucide_react_1.MessageCircle className="mr-2 h-5 w-5"/>
          Table Chat
        </card_1.CardTitle>
      </card_1.CardHeader>
      
      <card_1.CardContent className="p-0">
        {/* Messages Area */}
        <div className="h-64 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 ? (<div className="text-casino-cream/60 text-sm italic text-center">
              No messages yet. Say hello to your fellow players!
            </div>) : (messages.map((message) => (<div key={message.id} className="flex items-start space-x-2">
                {message.messageType === "system" ? (<div className="text-casino-gold text-sm italic w-full text-center">
                    {message.message}
                  </div>) : (<>
                    <div className="w-6 h-6 rounded-full bg-casino-gold text-black text-xs flex items-center justify-center flex-shrink-0">
                      {message.playerName[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="text-casino-gold font-semibold text-sm">
                          {message.playerName}:
                        </span>
                        <span className="text-casino-cream/60 text-xs">
                          {formatTime(message.timestamp || new Date())}
                        </span>
                      </div>
                      <div className="text-casino-cream text-sm mt-1">
                        {message.message}
                      </div>
                    </div>
                  </>)}
              </div>)))}
          <div ref={messagesEndRef}/>
        </div>
        
        {/* Input Area */}
        <div className="p-4 border-t border-casino-gold/30">
          <div className="flex space-x-2 mb-3">
            <input_1.Input type="text" placeholder="Type a message..." maxLength={200} value={chatMessage} onChange={(e) => setChatMessage(e.target.value)} onKeyPress={handleKeyPress} className="flex-1 bg-gray-900 border-casino-gold/30 text-casino-cream text-sm focus:border-casino-gold"/>
            <button_1.Button onClick={handleSendMessage} className="bg-casino-gold text-black hover:bg-yellow-400 px-3 py-2" disabled={!chatMessage.trim()}>
              <lucide_react_1.Send className="h-4 w-4"/>
            </button_1.Button>
          </div>
          
          {/* Quick Emotes */}
          <div className="flex space-x-2">
            {["👍", "😄", "🎉", "🤔", "😮", "💯"].map((emote) => (<button_1.Button key={emote} onClick={() => handleSendEmote(emote)} className="bg-gray-800 hover:bg-gray-700 text-casino-cream px-2 py-1 text-sm">
                {emote}
              </button_1.Button>))}
          </div>
        </div>
      </card_1.CardContent>
    </card_1.Card>);
}

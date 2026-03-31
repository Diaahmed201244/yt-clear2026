"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = MultiplayerChat;
const react_1 = require("react");
const react_query_1 = require("@tanstack/react-query");
const card_1 = require("@/components/ui/card");
const button_1 = require("@/components/ui/button");
const input_1 = require("@/components/ui/input");
const scroll_area_1 = require("@/components/ui/scroll-area");
const lucide_react_1 = require("lucide-react");
const queryClient_1 = require("@/lib/queryClient");
function MultiplayerChat({ gameId, currentUserId, onClose }) {
    const [message, setMessage] = (0, react_1.useState)("");
    const { data: chatMessages = [] } = (0, react_query_1.useQuery)({
        queryKey: ['/api/games', gameId, 'chat'],
    });
    const sendMessageMutation = (0, react_query_1.useMutation)({
        mutationFn: (messageText) => __awaiter(this, void 0, void 0, function* () {
            return (0, queryClient_1.apiRequest)('POST', `/api/games/${gameId}/chat`, {
                playerId: currentUserId,
                message: messageText,
            });
        }),
        onSuccess: () => {
            queryClient_1.queryClient.invalidateQueries({ queryKey: ['/api/games', gameId, 'chat'] });
            setMessage("");
        },
    });
    const handleSendMessage = () => {
        if (message.trim()) {
            sendMessageMutation.mutate(message);
        }
    };
    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSendMessage();
        }
    };
    const formatTime = (timestamp) => {
        return new Date(timestamp).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };
    return (<div className="fixed bottom-4 right-4 w-80">
      <card_1.Card>
        <card_1.CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <card_1.CardTitle className="text-md">Game Chat</card_1.CardTitle>
            <button_1.Button variant="ghost" size="sm" onClick={onClose}>
              <lucide_react_1.X className="h-4 w-4"/>
            </button_1.Button>
          </div>
        </card_1.CardHeader>
        
        <card_1.CardContent className="p-0">
          <scroll_area_1.ScrollArea className="h-64 p-4">
            {chatMessages.length === 0 ? (<div className="text-sm text-gray-500 text-center py-4">
                No messages yet
              </div>) : (<div className="space-y-3">
                {chatMessages.map((msg) => (<div key={msg.id} className="mb-3">
                    <div className="text-xs text-gray-500">
                      {formatTime(msg.timestamp)}
                    </div>
                    <div className="text-sm">
                      <span className={`font-medium ${msg.playerId === currentUserId ? 'text-primary' : 'text-gray-900'}`}>
                        {msg.playerId === currentUserId ? 'You' : 'Opponent'}:
                      </span>
                      <span className="ml-1">{msg.message}</span>
                    </div>
                  </div>))}
              </div>)}
          </scroll_area_1.ScrollArea>
          
          <div className="p-4 border-t border-gray-200">
            <div className="flex space-x-2">
              <input_1.Input value={message} onChange={(e) => setMessage(e.target.value)} onKeyPress={handleKeyPress} placeholder="Type a message..." className="flex-1" disabled={sendMessageMutation.isPending}/>
              <button_1.Button onClick={handleSendMessage} disabled={!message.trim() || sendMessageMutation.isPending} size="sm">
                <lucide_react_1.Send className="h-4 w-4"/>
              </button_1.Button>
            </div>
          </div>
        </card_1.CardContent>
      </card_1.Card>
    </div>);
}

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
exports.default = Home;
const react_1 = require("react");
const wouter_1 = require("wouter");
const card_1 = require("@/components/ui/card");
const button_1 = require("@/components/ui/button");
const input_1 = require("@/components/ui/input");
const label_1 = require("@/components/ui/label");
const separator_1 = require("@/components/ui/separator");
const lucide_react_1 = require("lucide-react");
const use_toast_1 = require("@/hooks/use-toast");
const queryClient_1 = require("@/lib/queryClient");
const GAME_MODES = [
    { label: "Classic (High Card)", value: "classic" },
    { label: "Blackjack", value: "blackjack" },
    { label: "War", value: "war" },
    { label: "Play vs Computer", value: "vs_computer" },
];
const DIFFICULTY_LEVELS = [
    { label: "Easy", value: "easy" },
    { label: "Medium", value: "medium" },
    { label: "Hard", value: "hard" },
];
function Home() {
    const [, setLocation] = (0, wouter_1.useLocation)();
    const [roomCode, setRoomCode] = (0, react_1.useState)("");
    const [username, setUsername] = (0, react_1.useState)("");
    const [isLoading, setIsLoading] = (0, react_1.useState)(false);
    const [selectedGameMode, setSelectedGameMode] = (0, react_1.useState)(() => localStorage.getItem("gameMode") || "classic");
    const [difficulty, setDifficulty] = (0, react_1.useState)("easy");
    const { toast } = (0, use_toast_1.useToast)();
    const handleCreateRoom = () => __awaiter(this, void 0, void 0, function* () {
        if (!username.trim()) {
            toast({
                title: "Username Required",
                description: "Please enter a username to create a room",
                variant: "destructive",
            });
            return;
        }
        setIsLoading(true);
        try {
            // Register/login user
            const userResponse = yield (0, queryClient_1.apiRequest)("POST", "/api/auth/register", {
                username: username.trim(),
                password: "temp123", // For demo purposes
            });
            const userData = yield userResponse.json();
            // Create room
            const roomResponse = yield (0, queryClient_1.apiRequest)("POST", "/api/rooms/create", {
                dealerName: "Lady Victoria",
                maxPlayers: selectedGameMode === "vs_computer" ? 2 : 6,
                maxRounds: 5,
                isVsComputer: selectedGameMode === "vs_computer",
            });
            const roomData = yield roomResponse.json();
            // Store user data
            localStorage.setItem("user", JSON.stringify(userData.user));
            localStorage.setItem("gameMode", selectedGameMode);
            // If vs computer, add a bot player to the room (simulate)
            if (selectedGameMode === "vs_computer") {
                localStorage.setItem("vs_computer", "true");
                localStorage.setItem("bot_difficulty", difficulty);
            }
            else {
                localStorage.removeItem("vs_computer");
                localStorage.removeItem("bot_difficulty");
            }
            // Navigate to game
            setLocation(`/game/${roomData.room.roomCode}`);
        }
        catch (error) {
            console.error("Error creating room:", error);
            toast({
                title: "Error",
                description: "Failed to create room. Please try again.",
                variant: "destructive",
            });
        }
        finally {
            setIsLoading(false);
        }
    });
    const handleJoinRoom = () => __awaiter(this, void 0, void 0, function* () {
        if (!username.trim() || !roomCode.trim()) {
            toast({
                title: "Missing Information",
                description: "Please enter both username and room code",
                variant: "destructive",
            });
            return;
        }
        setIsLoading(true);
        try {
            // Register/login user
            const userResponse = yield (0, queryClient_1.apiRequest)("POST", "/api/auth/register", {
                username: username.trim(),
                password: "temp123", // For demo purposes
            });
            const userData = yield userResponse.json();
            // Check if room exists
            const roomResponse = yield (0, queryClient_1.apiRequest)("GET", `/api/rooms/${roomCode.trim()}`);
            yield roomResponse.json(); // Will throw if room doesn't exist
            // Store user data
            localStorage.setItem("user", JSON.stringify(userData.user));
            // Navigate to game
            setLocation(`/game/${roomCode.trim()}`);
        }
        catch (error) {
            console.error("Error joining room:", error);
            toast({
                title: "Error",
                description: "Room not found or failed to join. Please check the room code.",
                variant: "destructive",
            });
        }
        finally {
            setIsLoading(false);
        }
    });
    return (<div className="min-h-screen bg-gradient-to-b from-gray-900 to-black">
      {/* Header */}
      <header className="bg-casino-red shadow-2xl border-b-4 border-casino-gold">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-center space-x-4">
            <lucide_react_1.Crown className="text-casino-gold text-4xl"/>
            <h1 className="text-casino-cream font-playfair text-4xl md:text-5xl font-bold">
              Royal Casino
            </h1>
          </div>
          <p className="text-casino-gold text-center mt-2 text-lg">
            Premium Multiplayer Card Gaming Experience
          </p>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Create Room */}
          <card_1.Card className="bg-black/80 border-casino-gold/30 shadow-2xl">
            <card_1.CardHeader className="text-center">
              <card_1.CardTitle className="text-casino-gold font-playfair text-2xl flex items-center justify-center space-x-2">
                <lucide_react_1.Crown className="h-6 w-6"/>
                <span>Create Private Table</span>
              </card_1.CardTitle>
            </card_1.CardHeader>
            <card_1.CardContent className="space-y-6">
              <div className="space-y-2">
                <label_1.Label htmlFor="username" className="text-casino-cream">Your Name</label_1.Label>
                <input_1.Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Enter your username" className="bg-gray-900 border-casino-gold/30 text-casino-cream focus:border-casino-gold"/>
              </div>
              <div className="space-y-2">
                <label_1.Label className="text-casino-cream">Game Mode</label_1.Label>
                <div className="flex space-x-2 flex-wrap">
                  {GAME_MODES.map((mode) => (<button_1.Button key={mode.value} type="button" variant={selectedGameMode === mode.value ? "default" : "outline"} className={selectedGameMode === mode.value ? "bg-casino-gold text-black" : "bg-gray-800 text-casino-cream"} onClick={() => setSelectedGameMode(mode.value)}>
                      {mode.label}
                    </button_1.Button>))}
                </div>
                {selectedGameMode === "vs_computer" && (<div className="mt-4">
                    <label_1.Label className="text-casino-cream">Difficulty</label_1.Label>
                    <div className="flex space-x-2 mt-2">
                      {DIFFICULTY_LEVELS.map((level) => (<button_1.Button key={level.value} type="button" variant={difficulty === level.value ? "default" : "outline"} className={difficulty === level.value ? "bg-casino-gold text-black" : "bg-gray-800 text-casino-cream"} onClick={() => setDifficulty(level.value)}>
                          {level.label}
                        </button_1.Button>))}
                    </div>
                  </div>)}
              </div>
              <button_1.Button onClick={handleCreateRoom} disabled={isLoading} className="w-full bg-casino-gold text-black hover:bg-yellow-400 font-semibold py-3">
                {isLoading ? "Creating..." : "Create Private Table"}
              </button_1.Button>
            </card_1.CardContent>
          </card_1.Card>

          {/* Join Room */}
          <card_1.Card className="bg-black/80 border-casino-gold/30 shadow-2xl">
            <card_1.CardHeader className="text-center">
              <card_1.CardTitle className="text-casino-gold font-playfair text-2xl flex items-center justify-center space-x-2">
                <lucide_react_1.Coins className="h-6 w-6"/>
                <span>Join Existing Table</span>
              </card_1.CardTitle>
            </card_1.CardHeader>
            <card_1.CardContent className="space-y-6">
              <div className="space-y-2">
                <label_1.Label htmlFor="join-username" className="text-casino-cream">Your Name</label_1.Label>
                <input_1.Input id="join-username" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Enter your username" className="bg-gray-900 border-casino-gold/30 text-casino-cream focus:border-casino-gold"/>
              </div>

              <div className="space-y-2">
                <label_1.Label htmlFor="room-code" className="text-casino-cream">Room Code</label_1.Label>
                <input_1.Input id="room-code" value={roomCode} onChange={(e) => setRoomCode(e.target.value.toUpperCase())} placeholder="ROYAL-XXXX" className="bg-gray-900 border-casino-gold/30 text-casino-cream focus:border-casino-gold font-mono"/>
              </div>

              <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-600">
                <h3 className="text-casino-cream font-semibold mb-2 text-sm">How to Get Room Code:</h3>
                <ul className="text-casino-cream text-xs space-y-1">
                  <li>• Ask the table host for the room code</li>
                  <li>• Room codes are in format: ROYAL-XXXX</li>
                  <li>• Join friends' private tables instantly</li>
                </ul>
              </div>

              <button_1.Button onClick={handleJoinRoom} disabled={isLoading} className="w-full bg-casino-green text-white hover:bg-green-700 font-semibold py-3">
                {isLoading ? "Joining..." : "Join Table"}
              </button_1.Button>
            </card_1.CardContent>
          </card_1.Card>
        </div>

        <separator_1.Separator className="my-12 bg-casino-gold/30"/>

        {/* Features */}
        <div className="text-center">
          <h2 className="text-casino-gold font-playfair text-3xl font-bold mb-8">
            Premium Casino Experience
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-black/60 rounded-xl p-6 border border-casino-gold/30">
              <div className="text-casino-gold text-3xl mb-4">♠️</div>
              <h3 className="text-casino-cream font-semibold text-lg mb-2">Real-Time Multiplayer</h3>
              <p className="text-casino-cream/80 text-sm">
                Play with 2-6 players in synchronized real-time gameplay with voice chat
              </p>
            </div>
            
            <div className="bg-black/60 rounded-xl p-6 border border-casino-gold/30">
              <div className="text-casino-gold text-3xl mb-4">💰</div>
              <h3 className="text-casino-cream font-semibold text-lg mb-2">Gold & Silver Bars</h3>
              <p className="text-casino-cream/80 text-sm">
                Convert your coded money into valuable betting bars
              </p>
            </div>
            
            <div className="bg-black/60 rounded-xl p-6 border border-casino-gold/30">
              <div className="text-casino-gold text-3xl mb-4">🎙️</div>
              <h3 className="text-casino-cream font-semibold text-lg mb-2">Voice Communication</h3>
              <p className="text-casino-cream/80 text-sm">
                Paltalk-style audio chat with push-to-talk and quality controls
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>);
}

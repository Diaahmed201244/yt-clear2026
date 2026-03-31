"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const react_query_1 = require("@tanstack/react-query");
const react_1 = require("react");
const CasinoLayout_1 = require("./components/casino/CasinoLayout");
const AuthModal_1 = require("./components/auth/AuthModal");
const useAuth_1 = require("./lib/stores/useAuth");
const useAudio_1 = require("./lib/stores/useAudio");
require("@fontsource/inter");
const queryClient = new react_query_1.QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes
            refetchOnWindowFocus: false,
        },
    },
});
function App() {
    const { user, isLoading } = (0, useAuth_1.useAuth)();
    const [showAuthModal, setShowAuthModal] = (0, react_1.useState)(!user && !isLoading);
    // Initialize audio on first user interaction
    const initializeAudio = () => {
        const audio = useAudio_1.useAudio.getState();
        if (!audio.backgroundMusic) {
            const bgMusic = new Audio("/sounds/background.mp3");
            bgMusic.loop = true;
            bgMusic.volume = 0.3;
            audio.setBackgroundMusic(bgMusic);
        }
        if (!audio.hitSound) {
            const hitSound = new Audio("/sounds/hit.mp3");
            audio.setHitSound(hitSound);
        }
        if (!audio.successSound) {
            const successSound = new Audio("/sounds/success.mp3");
            audio.setSuccessSound(successSound);
        }
    };
    if (isLoading) {
        return (<div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-400 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-white">Loading Casino...</h2>
        </div>
      </div>);
    }
    return (<react_query_1.QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900" onClick={initializeAudio}>
        {user ? (<CasinoLayout_1.CasinoLayout />) : (<AuthModal_1.AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} onSuccess={() => setShowAuthModal(false)}/>)}
      </div>
    </react_query_1.QueryClientProvider>);
}
exports.default = App;

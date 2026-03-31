"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useGame = exports.GameProvider = void 0;
const client_1 = require("react-dom/client");
const App_1 = require("./App");
require("./index.css");
// If you see "Cannot find module './context/GameContext'", it means the file does not exist or is misnamed.
// 1. Check if 'client/src/context/GameContext.tsx' (or .js) exists.
// 2. If not, create it as below:
const react_1 = require("react");
const GameContext = (0, react_1.createContext)(undefined);
const GameProvider = ({ children }) => {
    const [state, setState] = (0, react_1.useState)({});
    return (<GameContext.Provider value={{ state, setState }}>
            {children}
        </GameContext.Provider>);
};
exports.GameProvider = GameProvider;
const useGame = () => {
    const context = (0, react_1.useContext)(GameContext);
    if (!context)
        throw new Error("useGame must be used within a GameProvider");
    return context;
};
exports.useGame = useGame;
(0, client_1.createRoot)(document.getElementById("root")).render(<exports.GameProvider>
		<App_1.default />
	</exports.GameProvider>);

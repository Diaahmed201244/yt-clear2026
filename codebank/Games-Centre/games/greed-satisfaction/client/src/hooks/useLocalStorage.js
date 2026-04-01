"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useLocalStorage = useLocalStorage;
const react_1 = require("react");
function useLocalStorage(key, initialValue) {
    const [storedValue, setStoredValue] = (0, react_1.useState)(() => {
        try {   
            const item = window.localStorage.getItem(key);
            // Special handling for daily reset
            if (key === 'hasPlayedToday') {
                const lastPlayDate = localStorage.getItem('lastPlayDate');
                const today = new Date().toDateString();
                if (lastPlayDate !== today) {
                    // New day, reset the flag
                    localStorage.setItem('lastPlayDate', today);
                    return false;
                }
            }
            return item ? JSON.parse(item) : initialValue;
        }
        catch (error) {
            console.error(`Error reading localStorage key "${key}":`, error);
            return initialValue;
        }
    });
    const setValue = (value) => {
        try {   
            const valueToStore = value instanceof Function ? value(storedValue) : value;
            setStoredValue(valueToStore);
            window.localStorage.setItem(key, JSON.stringify(valueToStore));
            // Set play date when recording play
            if (key === 'hasPlayedToday' && valueToStore) {
                localStorage.setItem('lastPlayDate', new Date().toDateString());
            }
        }
        catch (error) {
            console.error(`Error setting localStorage key "${key}":`, error);
        }
    };
    return [storedValue, setValue];
}

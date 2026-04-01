import { useState } from 'react';
export function useLocalStorage(key, initialValue) {
    const [storedValue, setStoredValue] = useState(() => {
        try {   
            const item = window.localStorage.getItem(key);
            if (key === 'hasPlayedToday') {
                const lastPlayDate = localStorage.getItem('lastPlayDate');
                const today = new Date().toDateString();
                if (lastPlayDate !== today) {
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

import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
export function cn(...inputs) {
    return twMerge(clsx(inputs));
}
const getLocalStorage = (key) => JSON.parse(window.localStorage.getItem(key) || "null");
const setLocalStorage = (key, value) => window.localStorage.setItem(key, JSON.stringify(value));
export { getLocalStorage, setLocalStorage };

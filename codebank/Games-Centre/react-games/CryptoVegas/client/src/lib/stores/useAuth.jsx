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
exports.useAuth = void 0;
const zustand_1 = require("zustand");
const middleware_1 = require("zustand/middleware");
exports.useAuth = (0, zustand_1.create)()((0, middleware_1.persist)((set, get) => ({
    user: null,
    isLoading: false,
    login: (username, password) => __awaiter(void 0, void 0, void 0, function* () {
        set({ isLoading: true });
        try {
            // Simulate API call delay
            yield new Promise(resolve => setTimeout(resolve, 1000));
            // Check if user exists in localStorage (simulated database)
            const existingUsers = JSON.parse(localStorage.getItem('casino_users') || '[]');
            const user = existingUsers.find((u) => u.username === username && u.password === password);
            if (user) {
                const userData = {
                    id: user.id,
                    username: user.username,
                    balance: user.balance,
                    joinedAt: user.joinedAt
                };
                set({ user: userData, isLoading: false });
                console.log('Login successful:', username);
                return true;
            }
            else {
                console.log('Login failed: Invalid credentials');
                set({ isLoading: false });
                return false;
            }
        }
        catch (error) {
            console.error('Login error:', error);
            set({ isLoading: false });
            return false;
        }
    }),
    register: (username, password) => __awaiter(void 0, void 0, void 0, function* () {
        set({ isLoading: true });
        try {
            // Simulate API call delay
            yield new Promise(resolve => setTimeout(resolve, 1000));
            // Check if username already exists
            const existingUsers = JSON.parse(localStorage.getItem('casino_users') || '[]');
            const userExists = existingUsers.find((u) => u.username === username);
            if (userExists) {
                console.log('Registration failed: Username already exists');
                set({ isLoading: false });
                return false;
            }
            // Create new user
            const newUser = {
                id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                username,
                password, // In real app, this would be hashed
                balance: 10000, // Starting balance of 10,000 credits
                joinedAt: new Date().toISOString()
            };
            // Save to localStorage
            const updatedUsers = [...existingUsers, newUser];
            localStorage.setItem('casino_users', JSON.stringify(updatedUsers));
            const userData = {
                id: newUser.id,
                username: newUser.username,
                balance: newUser.balance,
                joinedAt: newUser.joinedAt
            };
            set({ user: userData, isLoading: false });
            console.log('Registration successful:', username);
            return true;
        }
        catch (error) {
            console.error('Registration error:', error);
            set({ isLoading: false });
            return false;
        }
    }),
    logout: () => {
        set({ user: null });
        console.log('User logged out');
    },
    updateBalance: (newBalance) => {
        const { user } = get();
        if (user) {
            const updatedUser = Object.assign(Object.assign({}, user), { balance: newBalance });
            set({ user: updatedUser });
            // Update in localStorage
            const existingUsers = JSON.parse(localStorage.getItem('casino_users') || '[]');
            const updatedUsers = existingUsers.map((u) => u.id === user.id ? Object.assign(Object.assign({}, u), { balance: newBalance }) : u);
            localStorage.setItem('casino_users', JSON.stringify(updatedUsers));
        }
    }
}), {
    name: "casino-auth",
    partialize: (state) => ({ user: state.user }),
}));

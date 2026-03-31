<<<<<<< HEAD
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
exports.queryClient = exports.getQueryFn = void 0;
exports.apiRequest = apiRequest;
const react_query_1 = require("@tanstack/react-query");
function throwIfResNotOk(res) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!res.ok) {
            const text = (yield res.text()) || res.statusText;
            throw new Error(`${res.status}: ${text}`);
        }
    });
}
function apiRequest(method, url, data) {
    return __awaiter(this, void 0, void 0, function* () {
        const res = yield fetch(url, {
            method,
            headers: data ? { "Content-Type": "application/json" } : {},
            body: data ? JSON.stringify(data) : undefined,
            credentials: "include",
        });
        yield throwIfResNotOk(res);
        return res;
    });
}
const getQueryFn = ({ on401: unauthorizedBehavior }) => (_a) => __awaiter(void 0, [_a], void 0, function* ({ queryKey }) {
    const res = yield fetch(queryKey.join("/"), {
        credentials: "include",
    });
    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
        return null;
    }
    yield throwIfResNotOk(res);
    return yield res.json();
});
exports.getQueryFn = getQueryFn;
exports.queryClient = new react_query_1.QueryClient({
    defaultOptions: {
        queries: {
            queryFn: (0, exports.getQueryFn)({ on401: "throw" }),
            refetchInterval: false,
            refetchOnWindowFocus: false,
            staleTime: Infinity,
            retry: false,
        },
        mutations: {
            retry: false,
        },
    },
=======
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 30, // 30 minutes
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 2,
      onError: (error) => {
        console.error('[E7ki] Mutation error:', error);
      }
    }
  }
>>>>>>> 715f14454 (BACKUP: Pre-modularization state - 4,827 line server.js)
});

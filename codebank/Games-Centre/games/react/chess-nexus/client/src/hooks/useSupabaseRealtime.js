import { useEffect, useRef } from "react";
import { queryClient } from "@/lib/queryClient";
export function useSupabaseRealtime(gameId) {
    const subscriptionRef = useRef(null);
    useEffect(() => {
        if (!gameId)
            return;
        const interval = setInterval(() => {
            queryClient.invalidateQueries({ queryKey: ['/api/games', gameId, 'moves'] });
            queryClient.invalidateQueries({ queryKey: ['/api/games', gameId, 'chat'] });
        }, 2000);
        return () => {
            clearInterval(interval);
        };
    }, [gameId]);
    return {
        connected: true,
        error: null,
    };
}

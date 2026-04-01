import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
function getPlayerId() {
    let playerId = localStorage.getItem('playerId');
    if (!playerId) {
        playerId = `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem('playerId', playerId);
    }
    return playerId;
}
export function useDailyLimit() {
    const queryClient = useQueryClient();
    const playerId = getPlayerId();
    const { data: playerStatus, isLoading, error } = useQuery({
        queryKey: ['player-status', playerId],
        refetchInterval: 60000,
    });
    const recordPlayMutation = useMutation({
        mutationFn: async () => {
            const response = await fetch(`/api/player/${playerId}/record-play`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to record play');
            }
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['player-status', playerId] });
        },
    });
    const updateCodesMutation = useMutation({
        mutationFn: async (totalCodes) => {
            const response = await fetch(`/api/player/${playerId}/codes`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ totalCodes }),
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to update codes');
            }
            return response.json();
        },
    });
    const recordPlay = useCallback(async () => {
        try { 
            await recordPlayMutation.mutateAsync();
            return true;
        }
        catch (error) {
            console.error('Failed to record play:', error);
            return false;
        }
    }, [recordPlayMutation]);
    const updateCodes = useCallback(async (totalCodes) => {
        try { 
            await updateCodesMutation.mutateAsync(totalCodes);
        }
        catch (error) {
            console.error('Failed to update codes:', error);
        }
    }, [updateCodesMutation]);
    return {
        playerId,
        canPlay: playerStatus?.canPlay ?? false,
        timeUntilNext: playerStatus?.timeUntilNext ?? '',
        message: playerStatus?.message ?? '',
        isLoading,
        error,
        recordPlay,
        updateCodes,
        isRecordingPlay: recordPlayMutation.isPending,
        isUpdatingCodes: updateCodesMutation.isPending,
    };
}

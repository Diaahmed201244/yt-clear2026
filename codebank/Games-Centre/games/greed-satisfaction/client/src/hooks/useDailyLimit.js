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
exports.useDailyLimit = useDailyLimit;
const react_1 = require("react");
const react_query_1 = require("@tanstack/react-query");
// Generate or retrieve persistent player ID
function getPlayerId() {
    let playerId = localStorage.getItem('playerId');
    if (!playerId) {
        playerId = `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem('playerId', playerId);
    }
    return playerId;
}
function useDailyLimit() {
    var _a, _b, _c;
    const queryClient = (0, react_query_1.useQueryClient)();
    const playerId = getPlayerId();
    // Check if player can play today
    const { data: playerStatus, isLoading, error } = (0, react_query_1.useQuery)({
        queryKey: ['player-status', playerId],
        refetchInterval: 60000, // Check every minute
    });
    // Record that player has played today
    const recordPlayMutation = (0, react_query_1.useMutation)({
        mutationFn: () => __awaiter(this, void 0, void 0, function* () {
            const response = yield fetch(`/api/player/${playerId}/record-play`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            if (!response.ok) {
                const error = yield response.json();
                throw new Error(error.message || 'Failed to record play');
            }
            return response.json();
        }),
        onSuccess: () => {
            // Invalidate player status to refresh the data
            queryClient.invalidateQueries({ queryKey: ['player-status', playerId] });
        },
    });
    // Update player codes in database
    const updateCodesMutation = (0, react_query_1.useMutation)({
        mutationFn: (totalCodes) => __awaiter(this, void 0, void 0, function* () {
            const response = yield fetch(`/api/player/${playerId}/codes`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ totalCodes }),
            });
            if (!response.ok) {
                const error = yield response.json();
                throw new Error(error.message || 'Failed to update codes');
            }
            return response.json();
        }),
    });
    const recordPlay = (0, react_1.useCallback)(() => __awaiter(this, void 0, void 0, function* () {
        try {
            yield recordPlayMutation.mutateAsync();
            return true;
        }
        catch (error) {
            console.error('Failed to record play:', error);
            return false;
        }
    }), [recordPlayMutation]);
    const updateCodes = (0, react_1.useCallback)((totalCodes) => __awaiter(this, void 0, void 0, function* () {
        try {
            yield updateCodesMutation.mutateAsync(totalCodes);
        }
        catch (error) {
            console.error('Failed to update codes:', error);
        }
    }), [updateCodesMutation]);
    return {
        playerId,
        canPlay: (_a = playerStatus === null || playerStatus === void 0 ? void 0 : playerStatus.canPlay) !== null && _a !== void 0 ? _a : false,
        timeUntilNext: (_b = playerStatus === null || playerStatus === void 0 ? void 0 : playerStatus.timeUntilNext) !== null && _b !== void 0 ? _b : '',
        message: (_c = playerStatus === null || playerStatus === void 0 ? void 0 : playerStatus.message) !== null && _c !== void 0 ? _c : '',
        isLoading,
        error,
        recordPlay,
        updateCodes,
        isRecordingPlay: recordPlayMutation.isPending,
        isUpdatingCodes: updateCodesMutation.isPending,
    };
}

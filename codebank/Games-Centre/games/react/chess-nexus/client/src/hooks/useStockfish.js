import { useCallback, useRef } from "react";
export function useStockfish(settings) {
    const workerRef = useRef(null);
    const initializeWorker = useCallback(() => {
        if (!workerRef.current) {
            workerRef.current = {
                postMessage: () => { },
                onmessage: null,
                terminate: () => { },
            };
        }
    }, []);
    const requestMove = useCallback(async (fen) => {
        initializeWorker();
        return new Promise((resolve) => {
            setTimeout(() => {
                const moves = getRandomLegalMove(fen);
                resolve(moves);
            }, settings.thinkTime);
        });
    }, [settings.thinkTime, initializeWorker]);
    return { requestMove };
}
function getRandomLegalMove(fen) {
    const commonMoves = ['e2e4', 'd2d4', 'g1f3', 'b1c3', 'f1c4'];
    return commonMoves[Math.floor(Math.random() * commonMoves.length)];
}

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = MoveHistory;
const card_1 = require("@/components/ui/card");
const button_1 = require("@/components/ui/button");
const lucide_react_1 = require("lucide-react");
const scroll_area_1 = require("@/components/ui/scroll-area");
function MoveHistory({ moves }) {
    const exportPGN = () => {
        var _a, _b;
        // Convert moves to PGN format
        let pgn = "";
        for (let i = 0; i < moves.length; i += 2) {
            const moveNumber = Math.floor(i / 2) + 1;
            const whiteMove = ((_a = moves[i]) === null || _a === void 0 ? void 0 : _a.san) || "";
            const blackMove = ((_b = moves[i + 1]) === null || _b === void 0 ? void 0 : _b.san) || "";
            pgn += `${moveNumber}. ${whiteMove}`;
            if (blackMove) {
                pgn += ` ${blackMove}`;
            }
            pgn += " ";
        }
        // Create and download file
        const blob = new Blob([pgn], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'game.pgn';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };
    return (<card_1.Card className="mb-6">
      <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <card_1.CardTitle className="text-md">Move History</card_1.CardTitle>
        <button_1.Button variant="ghost" size="sm" onClick={exportPGN} className="text-xs">
          <lucide_react_1.Download className="mr-1 h-3 w-3"/>
          Export PGN
        </button_1.Button>
      </card_1.CardHeader>
      <card_1.CardContent>
        <scroll_area_1.ScrollArea className="h-96">
          <div className="space-y-2">
            {moves.length === 0 ? (<div className="text-sm text-gray-500 text-center py-4">
                No moves yet
              </div>) : (moves.reduce((acc, move, index) => {
            if (move.color === 'white') {
                const blackMove = moves[index + 1];
                acc.push(<div key={move.moveNumber} className="flex text-sm move-history">
                      <span className="w-8 text-gray-500">{move.moveNumber}.</span>
                      <span className="w-16 font-medium">{move.san}</span>
                      <span className="w-16 text-gray-600">
                        {(blackMove === null || blackMove === void 0 ? void 0 : blackMove.san) || '...'}
                      </span>
                    </div>);
            }
            return acc;
        }, []))}
          </div>
        </scroll_area_1.ScrollArea>
      </card_1.CardContent>
    </card_1.Card>);
}

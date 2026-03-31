"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Balance = Balance;
const useAuth_1 = require("@/lib/stores/useAuth");
const gameUtils_1 = require("@/lib/gameUtils");
const card_1 = require("@/components/ui/card");
function Balance() {
    const { user } = (0, useAuth_1.useAuth)();
    if (!user)
        return null;
    return (<card_1.Card className="px-4 py-2 casino-card inline-block">
      <div className="flex items-center space-x-2">
        <span className="text-sm text-gray-400">Balance:</span>
        <span className="text-lg font-bold text-green-400">
          💰 {(0, gameUtils_1.formatCurrency)(user.balance)}
        </span>
      </div>
    </card_1.Card>);
}

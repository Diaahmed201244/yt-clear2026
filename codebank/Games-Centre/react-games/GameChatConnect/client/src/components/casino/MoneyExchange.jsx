"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = MoneyExchange;
const react_1 = require("react");
const card_1 = require("@/components/ui/card");
const button_1 = require("@/components/ui/button");
const input_1 = require("@/components/ui/input");
const label_1 = require("@/components/ui/label");
const lucide_react_1 = require("lucide-react");
const use_toast_1 = require("@/hooks/use-toast");
function MoneyExchange({ user, onExchange }) {
    const [exchangeAmount, setExchangeAmount] = (0, react_1.useState)("");
    const { toast } = (0, use_toast_1.useToast)();
    const handleExchange = (amount) => {
        if (user.balance < amount) {
            toast({
                title: "Insufficient Balance",
                description: "You don't have enough money for this exchange",
                variant: "destructive",
            });
            return;
        }
        onExchange(amount);
        toast({
            title: "Exchange Successful",
            description: `Exchanged $${amount} for betting bars`,
        });
    };
    const handleCustomExchange = () => {
        const amount = parseInt(exchangeAmount);
        if (isNaN(amount) || amount < 10) {
            toast({
                title: "Invalid Amount",
                description: "Please enter a valid amount (minimum $10)",
                variant: "destructive",
            });
            return;
        }
        handleExchange(amount);
        setExchangeAmount("");
    };
    return (<card_1.Card className="bg-black/80 border-casino-gold/30 backdrop-blur-sm">
      <card_1.CardHeader>
        <card_1.CardTitle className="text-casino-gold font-playfair text-lg flex items-center">
          <lucide_react_1.Coins className="mr-2"/>
          Exchange Money
        </card_1.CardTitle>
      </card_1.CardHeader>
      <card_1.CardContent className="space-y-4">
        <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-600">
          <div className="flex justify-between items-center">
            <span className="text-casino-cream text-sm">Your Balance:</span>
            <span className="text-casino-gold font-semibold">${user.balance.toLocaleString()}</span>
          </div>
        </div>

        <div className="space-y-2">
          <label_1.Label className="text-casino-cream text-sm">Exchange Amount</label_1.Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-casino-gold">$</span>
            <input_1.Input type="number" placeholder="Enter amount" min="10" value={exchangeAmount} onChange={(e) => setExchangeAmount(e.target.value)} className="pl-8 bg-gray-900 border-casino-gold/30 text-casino-cream focus:border-casino-gold"/>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="text-center">
            <div className="gold-bar w-full h-8 rounded-lg mb-2 flex items-center justify-center">
              <span className="text-black font-bold text-sm">GOLD</span>
            </div>
            <p className="text-casino-cream text-xs">$100+ = Gold Bar</p>
          </div>
          <div className="text-center">
            <div className="silver-bar w-full h-8 rounded-lg mb-2 flex items-center justify-center">
              <span className="text-black font-bold text-sm">SILVER</span>
            </div>
            <p className="text-casino-cream text-xs">$10-99 = Silver Bar</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button_1.Button onClick={() => handleExchange(100)} className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black hover:from-yellow-300 hover:to-yellow-500 font-semibold py-2 px-3 text-sm" disabled={user.balance < 100}>
            Buy Gold Bar
            <div className="text-xs opacity-75">$100</div>
          </button_1.Button>
          <button_1.Button onClick={() => handleExchange(10)} className="bg-gradient-to-r from-gray-300 to-gray-500 text-black hover:from-gray-200 hover:to-gray-400 font-semibold py-2 px-3 text-sm" disabled={user.balance < 10}>
            Buy Silver Bar
            <div className="text-xs opacity-75">$10</div>
          </button_1.Button>
        </div>

        <button_1.Button onClick={handleCustomExchange} className="w-full bg-casino-green text-white hover:bg-green-700 font-semibold py-3" disabled={!exchangeAmount || parseInt(exchangeAmount) < 10}>
          Exchange Custom Amount
        </button_1.Button>
      </card_1.CardContent>
    </card_1.Card>);
}

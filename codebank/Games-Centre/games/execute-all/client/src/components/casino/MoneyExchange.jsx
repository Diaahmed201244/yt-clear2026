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
const soundManager_1 = require("@/lib/soundManager");
function MoneyExchange({ user, onExchange }) {
    const [amount, setAmount] = (0, react_1.useState)("");
    const { toast } = (0, use_toast_1.useToast)();
    const handleExchange = () => {
        const exchangeAmount = parseInt(amount);
        if (!exchangeAmount || exchangeAmount < 10) {
            toast({
                title: "Invalid Amount",
                description: "Minimum exchange amount is $10",
                variant: "destructive",
            });
            return;
        }
        if (exchangeAmount > user.balance) {
            toast({
                title: "Insufficient Balance",
                description: "You don't have enough money to exchange",
                variant: "destructive",
            });
            return;
        }
        onExchange(exchangeAmount);
        setAmount("");
        soundManager_1.soundManager.playCoinSound();
        toast({
            title: "Exchange Successful",
            description: `Converted $${exchangeAmount} into bars`,
        });
    };
    const handleQuickBuy = (amount) => {
        if (amount > user.balance) {
            toast({
                title: "Insufficient Balance",
                description: "You don't have enough money to buy this bar",
                variant: "destructive",
            });
            return;
        }
        onExchange(amount);
        soundManager_1.soundManager.playCoinSound();
        const barType = amount >= 100 ? "Gold" : "Silver";
        toast({
            title: `${barType} Bar Purchased`,
            description: `Bought 1 ${barType.toLowerCase()} bar for $${amount}`,
        });
    };
    const calculateBars = (amount) => {
        const goldBars = Math.floor(amount / 100);
        const silverBars = Math.floor((amount % 100) / 10);
        return { goldBars, silverBars };
    };
    const previewAmount = parseInt(amount) || 0;
    const { goldBars, silverBars } = calculateBars(previewAmount);
    return (<card_1.Card className="bg-black/80 border-casino-gold/30 backdrop-blur-sm">
      <card_1.CardHeader>
        <card_1.CardTitle className="text-casino-gold font-playfair text-lg flex items-center">
          <lucide_react_1.Coins className="h-5 w-5 mr-2"/>
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
          <label_1.Label htmlFor="exchange-amount" className="text-casino-cream">
            Coded Money Amount
          </label_1.Label>
          <div className="relative">
            <lucide_react_1.DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-casino-gold h-4 w-4"/>
            <input_1.Input id="exchange-amount" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Enter amount" min="10" max={user.balance} className="pl-10 bg-gray-900 border-casino-gold/30 text-casino-cream focus:border-casino-gold"/>
          </div>
        </div>

        {/* Preview */}
        {previewAmount >= 10 && (<div className="bg-casino-green/20 rounded-lg p-3 border border-casino-green/30">
            <h4 className="text-casino-cream font-semibold text-sm mb-2">You'll Receive:</h4>
            <div className="space-y-2">
              {goldBars > 0 && (<div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="gold-bar w-6 h-4 rounded"></div>
                    <span className="text-casino-cream text-sm">Gold Bars</span>
                  </div>
                  <span className="text-casino-gold font-semibold">{goldBars}</span>
                </div>)}
              {silverBars > 0 && (<div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="silver-bar w-6 h-4 rounded"></div>
                    <span className="text-casino-cream text-sm">Silver Bars</span>
                  </div>
                  <span className="text-casino-gold font-semibold">{silverBars}</span>
                </div>)}
            </div>
          </div>)}

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

        <div className="grid grid-cols-2 gap-3 mb-4">
          <button_1.Button onClick={() => handleQuickBuy(100)} disabled={user.balance < 100} className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black hover:from-yellow-300 hover:to-yellow-500 font-semibold">
            Buy 1 Gold Bar
            <div className="text-xs opacity-75">$100</div>
          </button_1.Button>
          <button_1.Button onClick={() => handleQuickBuy(10)} disabled={user.balance < 10} className="bg-gradient-to-r from-gray-300 to-gray-500 text-black hover:from-gray-200 hover:to-gray-400 font-semibold">
            Buy 1 Silver Bar
            <div className="text-xs opacity-75">$10</div>
          </button_1.Button>
        </div>

        <button_1.Button onClick={handleExchange} disabled={!amount || parseInt(amount) < 10 || parseInt(amount) > user.balance} className="w-full bg-casino-green text-white hover:bg-green-700 font-semibold">
          Exchange Custom Amount
        </button_1.Button>
      </card_1.CardContent>
    </card_1.Card>);
}

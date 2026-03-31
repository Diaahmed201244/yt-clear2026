"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = AISettings;
const card_1 = require("@/components/ui/card");
const label_1 = require("@/components/ui/label");
const select_1 = require("@/components/ui/select");
function AISettings({ settings, onSettingsChange }) {
    const handleDifficultyChange = (difficulty) => {
        onSettingsChange(Object.assign(Object.assign({}, settings), { difficulty }));
    };
    const handleThinkTimeChange = (thinkTime) => {
        onSettingsChange(Object.assign(Object.assign({}, settings), { thinkTime: parseInt(thinkTime) }));
    };
    return (<card_1.Card className="mb-6">
      <card_1.CardHeader>
        <card_1.CardTitle className="text-md">AI Settings</card_1.CardTitle>
      </card_1.CardHeader>
      <card_1.CardContent className="space-y-4">
        <div>
          <label_1.Label className="text-sm font-medium text-gray-700 mb-2 block">
            Difficulty
          </label_1.Label>
          <select_1.Select value={settings.difficulty} onValueChange={handleDifficultyChange}>
            <select_1.SelectTrigger>
              <select_1.SelectValue />
            </select_1.SelectTrigger>
            <select_1.SelectContent>
              <select_1.SelectItem value="beginner">Beginner (800)</select_1.SelectItem>
              <select_1.SelectItem value="intermediate">Intermediate (1200)</select_1.SelectItem>
              <select_1.SelectItem value="advanced">Advanced (1800)</select_1.SelectItem>
              <select_1.SelectItem value="master">Master (2400)</select_1.SelectItem>
            </select_1.SelectContent>
          </select_1.Select>
        </div>
        
        <div>
          <label_1.Label className="text-sm font-medium text-gray-700 mb-2 block">
            Think Time
          </label_1.Label>
          <select_1.Select value={settings.thinkTime.toString()} onValueChange={handleThinkTimeChange}>
            <select_1.SelectTrigger>
              <select_1.SelectValue />
            </select_1.SelectTrigger>
            <select_1.SelectContent>
              <select_1.SelectItem value="500">0.5 seconds</select_1.SelectItem>
              <select_1.SelectItem value="1000">1 second</select_1.SelectItem>
              <select_1.SelectItem value="2000">2 seconds</select_1.SelectItem>
              <select_1.SelectItem value="5000">5 seconds</select_1.SelectItem>
            </select_1.SelectContent>
          </select_1.Select>
        </div>
      </card_1.CardContent>
    </card_1.Card>);
}

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
exports.default = AudioSettingsModal;
const react_1 = require("react");
const dialog_1 = require("@/components/ui/dialog");
const button_1 = require("@/components/ui/button");
const label_1 = require("@/components/ui/label");
const select_1 = require("@/components/ui/select");
const switch_1 = require("@/components/ui/switch");
const lucide_react_1 = require("lucide-react");
function AudioSettingsModal({ isOpen, onClose, audioDevices, onDeviceChange }) {
    const [selectedMicrophone, setSelectedMicrophone] = (0, react_1.useState)("");
    const [selectedSpeaker, setSelectedSpeaker] = (0, react_1.useState)("");
    const [audioQuality, setAudioQuality] = (0, react_1.useState)("medium");
    const [noiseCancellation, setNoiseCancellation] = (0, react_1.useState)(true);
    const [echoCancellation, setEchoCancellation] = (0, react_1.useState)(true);
    const [autoGainControl, setAutoGainControl] = (0, react_1.useState)(false);
    const [isTesting, setIsTesting] = (0, react_1.useState)(false);
    const microphones = audioDevices.filter(device => device.kind === 'audioinput');
    const speakers = audioDevices.filter(device => device.kind === 'audiooutput');
    const handleTestAudio = () => __awaiter(this, void 0, void 0, function* () {
        setIsTesting(true);
        // TODO: Implement microphone test
        setTimeout(() => {
            setIsTesting(false);
        }, 3000);
    });
    const handleResetSettings = () => {
        setSelectedMicrophone("");
        setSelectedSpeaker("");
        setAudioQuality("medium");
        setNoiseCancellation(true);
        setEchoCancellation(true);
        setAutoGainControl(false);
    };
    const handleSaveSettings = () => {
        // TODO: Save settings to localStorage or user preferences
        onClose();
    };
    return (<dialog_1.Dialog open={isOpen} onOpenChange={onClose}>
      <dialog_1.DialogContent className="bg-black border-2 border-casino-gold max-w-md">
        <dialog_1.DialogHeader>
          <dialog_1.DialogTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <lucide_react_1.Settings className="mr-2 text-casino-gold"/>
              <span className="text-casino-cream font-playfair text-2xl font-bold">
                Audio Settings
              </span>
            </div>
            <button_1.Button onClick={onClose} variant="ghost" size="sm" className="text-casino-cream hover:text-white">
              <lucide_react_1.X className="h-4 w-4"/>
            </button_1.Button>
          </dialog_1.DialogTitle>
        </dialog_1.DialogHeader>
        
        <div className="space-y-6">
          {/* Audio Device Selection */}
          <div className="space-y-4">
            <div>
              <label_1.Label className="text-casino-cream text-sm font-semibold mb-2 block">
                Microphone
              </label_1.Label>
              <select_1.Select value={selectedMicrophone} onValueChange={setSelectedMicrophone}>
                <select_1.SelectTrigger className="bg-gray-900 border-casino-gold/30 text-casino-cream">
                  <select_1.SelectValue placeholder="Select microphone"/>
                </select_1.SelectTrigger>
                <select_1.SelectContent>
                  {microphones.map((device) => (<select_1.SelectItem key={device.deviceId} value={device.deviceId}>
                      {device.label || "Default Microphone"}
                    </select_1.SelectItem>))}
                </select_1.SelectContent>
              </select_1.Select>
            </div>
            
            <div>
              <label_1.Label className="text-casino-cream text-sm font-semibold mb-2 block">
                Speakers
              </label_1.Label>
              <select_1.Select value={selectedSpeaker} onValueChange={setSelectedSpeaker}>
                <select_1.SelectTrigger className="bg-gray-900 border-casino-gold/30 text-casino-cream">
                  <select_1.SelectValue placeholder="Select speakers"/>
                </select_1.SelectTrigger>
                <select_1.SelectContent>
                  {speakers.map((device) => (<select_1.SelectItem key={device.deviceId} value={device.deviceId}>
                      {device.label || "Default Speakers"}
                    </select_1.SelectItem>))}
                </select_1.SelectContent>
              </select_1.Select>
            </div>
          </div>
          
          {/* Audio Quality Settings */}
          <div className="space-y-4">
            <div>
              <label_1.Label className="text-casino-cream text-sm font-semibold mb-2 block">
                Audio Quality
              </label_1.Label>
              <select_1.Select value={audioQuality} onValueChange={setAudioQuality}>
                <select_1.SelectTrigger className="bg-gray-900 border-casino-gold/30 text-casino-cream">
                  <select_1.SelectValue />
                </select_1.SelectTrigger>
                <select_1.SelectContent>
                  <select_1.SelectItem value="high">High Quality</select_1.SelectItem>
                  <select_1.SelectItem value="medium">Medium Quality</select_1.SelectItem>
                  <select_1.SelectItem value="low">Low Quality (Save Bandwidth)</select_1.SelectItem>
                </select_1.SelectContent>
              </select_1.Select>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label_1.Label className="text-casino-cream text-sm">Noise Cancellation</label_1.Label>
                <switch_1.Switch checked={noiseCancellation} onCheckedChange={setNoiseCancellation}/>
              </div>
              <div className="flex items-center justify-between">
                <label_1.Label className="text-casino-cream text-sm">Echo Cancellation</label_1.Label>
                <switch_1.Switch checked={echoCancellation} onCheckedChange={setEchoCancellation}/>
              </div>
              <div className="flex items-center justify-between">
                <label_1.Label className="text-casino-cream text-sm">Auto Gain Control</label_1.Label>
                <switch_1.Switch checked={autoGainControl} onCheckedChange={setAutoGainControl}/>
              </div>
            </div>
          </div>
          
          {/* Test Audio */}
          <div className="border-t border-gray-600 pt-4">
            <button_1.Button onClick={handleTestAudio} disabled={isTesting} className="w-full bg-casino-gold text-black hover:bg-yellow-400 font-semibold py-2">
              <lucide_react_1.Mic className="mr-2 h-4 w-4"/>
              {isTesting ? "Testing..." : "Test Microphone"}
            </button_1.Button>
          </div>
          
          <div className="flex space-x-3">
            <button_1.Button onClick={handleResetSettings} className="flex-1 bg-gray-600 text-white hover:bg-gray-700 font-semibold py-2">
              Reset to Default
            </button_1.Button>
            <button_1.Button onClick={handleSaveSettings} className="flex-1 bg-casino-green text-white hover:bg-green-700 font-semibold py-2">
              Save Settings
            </button_1.Button>
          </div>
        </div>
      </dialog_1.DialogContent>
    </dialog_1.Dialog>);
}

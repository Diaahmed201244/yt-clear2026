"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = FENDialog;
const react_1 = require("react");
const dialog_1 = require("@/components/ui/dialog");
const button_1 = require("@/components/ui/button");
const textarea_1 = require("@/components/ui/textarea");
const label_1 = require("@/components/ui/label");
const use_toast_1 = require("@/hooks/use-toast");
function FENDialog({ currentFEN, onImport, onExport, onClose }) {
    const [fenString, setFenString] = (0, react_1.useState)(currentFEN);
    const { toast } = (0, use_toast_1.useToast)();
    const handleLoadPosition = () => {
        try {
            onImport(fenString);
            onClose();
            toast({
                title: "Position loaded",
                description: "The chess position has been loaded successfully.",
            });
        }
        catch (error) {
            toast({
                title: "Invalid FEN",
                description: "The FEN string is not valid. Please check the format.",
                variant: "destructive",
            });
        }
    };
    const handleCopyFEN = () => {
        navigator.clipboard.writeText(currentFEN).then(() => {
            toast({
                title: "FEN copied",
                description: "The FEN string has been copied to clipboard.",
            });
        });
    };
    return (<dialog_1.Dialog open={true} onOpenChange={onClose}>
      <dialog_1.DialogContent className="sm:max-w-md">
        <dialog_1.DialogHeader>
          <dialog_1.DialogTitle>FEN Position</dialog_1.DialogTitle>
        </dialog_1.DialogHeader>
        
        <div className="space-y-4">
          <div>
            <label_1.Label htmlFor="fen-input" className="text-sm font-medium">
              FEN String
            </label_1.Label>
            <textarea_1.Textarea id="fen-input" value={fenString} onChange={(e) => setFenString(e.target.value)} placeholder="rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1" className="mt-2" rows={3}/>
          </div>
          
          <div className="flex space-x-3">
            <button_1.Button onClick={handleLoadPosition} className="flex-1">
              Load Position
            </button_1.Button>
            <button_1.Button variant="outline" onClick={handleCopyFEN} className="flex-1">
              Copy Current FEN
            </button_1.Button>
          </div>
        </div>
      </dialog_1.DialogContent>
    </dialog_1.Dialog>);
}

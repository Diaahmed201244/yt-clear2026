"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = AppHeader;
const lucide_react_1 = require("lucide-react");
const avatar_1 = require("@/components/ui/avatar");
function AppHeader({ user }) {
    return (<header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <lucide_react_1.Crown className="text-primary text-2xl mr-3"/>
            <h1 className="text-xl font-bold text-gray-900">ChessMaster Pro</h1>
          </div>
          
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#" className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium flex items-center">
              <lucide_react_1.BarChart3 className="w-4 h-4 mr-2"/>
              Dashboard
            </a>
            <a href="#" className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium flex items-center">
              <lucide_react_1.History className="w-4 h-4 mr-2"/>
              History
            </a>
            <a href="#" className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium flex items-center">
              <lucide_react_1.Trophy className="w-4 h-4 mr-2"/>
              Analysis
            </a>
          </nav>
          
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-600">
              Rating: {user.rating}
            </div>
            <avatar_1.Avatar className="w-8 h-8">
              <avatar_1.AvatarFallback className="bg-primary text-primary-foreground">
                <lucide_react_1.User className="w-4 h-4"/>
              </avatar_1.AvatarFallback>
            </avatar_1.Avatar>
          </div>
        </div>
      </div>
    </header>);
}

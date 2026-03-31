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
exports.AuthModal = AuthModal;
const react_1 = require("react");
const dialog_1 = require("@/components/ui/dialog");
const button_1 = require("@/components/ui/button");
const input_1 = require("@/components/ui/input");
const label_1 = require("@/components/ui/label");
const tabs_1 = require("@/components/ui/tabs");
const useAuth_1 = require("@/lib/stores/useAuth");
const lucide_react_1 = require("lucide-react");
function AuthModal({ isOpen, onClose, onSuccess }) {
    const { login, register, isLoading } = (0, useAuth_1.useAuth)();
    const [loginForm, setLoginForm] = (0, react_1.useState)({ username: '', password: '' });
    const [registerForm, setRegisterForm] = (0, react_1.useState)({ username: '', password: '', confirmPassword: '' });
    const [error, setError] = (0, react_1.useState)('');
    const handleLogin = (e) => __awaiter(this, void 0, void 0, function* () {
        e.preventDefault();
        setError('');
        if (!loginForm.username || !loginForm.password) {
            setError('Please fill in all fields');
            return;
        }
        const success = yield login(loginForm.username, loginForm.password);
        if (success) {
            onSuccess();
        }
        else {
            setError('Invalid username or password');
        }
    });
    const handleRegister = (e) => __awaiter(this, void 0, void 0, function* () {
        e.preventDefault();
        setError('');
        if (!registerForm.username || !registerForm.password || !registerForm.confirmPassword) {
            setError('Please fill in all fields');
            return;
        }
        if (registerForm.password !== registerForm.confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        if (registerForm.password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }
        const success = yield register(registerForm.username, registerForm.password);
        if (success) {
            onSuccess();
        }
        else {
            setError('Username already exists');
        }
    });
    return (<dialog_1.Dialog open={isOpen} onOpenChange={onClose}>
      <dialog_1.DialogContent className="sm:max-w-[425px] bg-gradient-to-br from-gray-900 to-blue-900 border-green-500/20">
        <dialog_1.DialogHeader>
          <dialog_1.DialogTitle className="text-2xl font-bold text-center bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
            🎰 Casino Royale
          </dialog_1.DialogTitle>
        </dialog_1.DialogHeader>
        
        <tabs_1.Tabs defaultValue="login" className="w-full">
          <tabs_1.TabsList className="grid w-full grid-cols-2 bg-gray-800">
            <tabs_1.TabsTrigger value="login" className="data-[state=active]:bg-green-600">Login</tabs_1.TabsTrigger>
            <tabs_1.TabsTrigger value="register" className="data-[state=active]:bg-green-600">Register</tabs_1.TabsTrigger>
          </tabs_1.TabsList>
          
          <tabs_1.TabsContent value="login" className="space-y-4 mt-4">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <label_1.Label htmlFor="login-username" className="text-gray-200">Username</label_1.Label>
                <input_1.Input id="login-username" type="text" placeholder="Enter your username" value={loginForm.username} onChange={(e) => setLoginForm(Object.assign(Object.assign({}, loginForm), { username: e.target.value }))} className="bg-gray-800 border-gray-600 text-white" disabled={isLoading}/>
              </div>
              <div className="space-y-2">
                <label_1.Label htmlFor="login-password" className="text-gray-200">Password</label_1.Label>
                <input_1.Input id="login-password" type="password" placeholder="Enter your password" value={loginForm.password} onChange={(e) => setLoginForm(Object.assign(Object.assign({}, loginForm), { password: e.target.value }))} className="bg-gray-800 border-gray-600 text-white" disabled={isLoading}/>
              </div>
              {error && <p className="text-red-400 text-sm">{error}</p>}
              <button_1.Button type="submit" className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700" disabled={isLoading}>
                {isLoading ? <lucide_react_1.Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}
                Login
              </button_1.Button>
            </form>
          </tabs_1.TabsContent>
          
          <tabs_1.TabsContent value="register" className="space-y-4 mt-4">
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <label_1.Label htmlFor="register-username" className="text-gray-200">Username</label_1.Label>
                <input_1.Input id="register-username" type="text" placeholder="Choose a username" value={registerForm.username} onChange={(e) => setRegisterForm(Object.assign(Object.assign({}, registerForm), { username: e.target.value }))} className="bg-gray-800 border-gray-600 text-white" disabled={isLoading}/>
              </div>
              <div className="space-y-2">
                <label_1.Label htmlFor="register-password" className="text-gray-200">Password</label_1.Label>
                <input_1.Input id="register-password" type="password" placeholder="Create a password" value={registerForm.password} onChange={(e) => setRegisterForm(Object.assign(Object.assign({}, registerForm), { password: e.target.value }))} className="bg-gray-800 border-gray-600 text-white" disabled={isLoading}/>
              </div>
              <div className="space-y-2">
                <label_1.Label htmlFor="confirm-password" className="text-gray-200">Confirm Password</label_1.Label>
                <input_1.Input id="confirm-password" type="password" placeholder="Confirm your password" value={registerForm.confirmPassword} onChange={(e) => setRegisterForm(Object.assign(Object.assign({}, registerForm), { confirmPassword: e.target.value }))} className="bg-gray-800 border-gray-600 text-white" disabled={isLoading}/>
              </div>
              {error && <p className="text-red-400 text-sm">{error}</p>}
              <button_1.Button type="submit" className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700" disabled={isLoading}>
                {isLoading ? <lucide_react_1.Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}
                Register & Get 10,000 Credits
              </button_1.Button>
            </form>
          </tabs_1.TabsContent>
        </tabs_1.Tabs>
        
        <p className="text-xs text-gray-400 text-center mt-4">
          🎁 New players receive 10,000 credits to start playing!
        </p>
      </dialog_1.DialogContent>
    </dialog_1.Dialog>);
}

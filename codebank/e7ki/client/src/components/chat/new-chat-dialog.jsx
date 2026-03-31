<<<<<<< HEAD
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
exports.NewChatDialog = NewChatDialog;
const react_1 = require("react");
const chat_context_1 = require("@/lib/chat-context");
const dialog_1 = require("@/components/ui/dialog");
const button_1 = require("@/components/ui/button");
const input_1 = require("@/components/ui/input");
const label_1 = require("@/components/ui/label");
const use_toast_1 = require("@/hooks/use-toast");
const lucide_react_1 = require("lucide-react");
function NewChatDialog({ children }) {
    const [open, setOpen] = (0, react_1.useState)(false);
    const [email, setEmail] = (0, react_1.useState)("");
    const [name, setName] = (0, react_1.useState)("");
    const [isLoading, setIsLoading] = (0, react_1.useState)(false);
    const { createNewChat } = (0, chat_context_1.useChat)();
    const { toast } = (0, use_toast_1.useToast)();
    const handleCreate = () => __awaiter(this, void 0, void 0, function* () {
        if (!email.trim() || !name.trim()) {
            toast({
                title: "Missing information",
                description: "Please enter both name and email address.",
                variant: "destructive",
            });
            return;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            toast({
                title: "Invalid email",
                description: "Please enter a valid email address.",
                variant: "destructive",
            });
            return;
        }
        setIsLoading(true);
        try {
            const newParticipant = {
                id: crypto.randomUUID(),
                name: name.trim(),
                email: email.trim().toLowerCase(),
                isOnline: false,
            };
            createNewChat(newParticipant);
            setOpen(false);
            setEmail("");
            setName("");
            toast({
                title: "Chat created",
                description: `Started a new conversation with ${name}.`,
            });
        }
        catch (error) {
            toast({
                title: "Error",
                description: "Failed to create chat. Please try again.",
                variant: "destructive",
            });
        }
        finally {
            setIsLoading(false);
        }
    });
    return (<dialog_1.Dialog open={open} onOpenChange={setOpen}>
      <dialog_1.DialogTrigger asChild>
        {children || (<button_1.Button size="icon" data-testid="button-new-chat">
            <lucide_react_1.Plus className="h-5 w-5"/>
          </button_1.Button>)}
      </dialog_1.DialogTrigger>
      <dialog_1.DialogContent className="sm:max-w-[400px]">
        <dialog_1.DialogHeader>
          <dialog_1.DialogTitle className="flex items-center gap-2">
            <lucide_react_1.MessageCircle className="h-5 w-5"/>
            Start New Chat
          </dialog_1.DialogTitle>
          <dialog_1.DialogDescription>
            Enter the contact details to start a new conversation.
          </dialog_1.DialogDescription>
        </dialog_1.DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label_1.Label htmlFor="name">Name</label_1.Label>
            <input_1.Input id="name" placeholder="Enter contact name" value={name} onChange={(e) => setName(e.target.value)} data-testid="input-contact-name"/>
          </div>
          <div className="space-y-2">
            <label_1.Label htmlFor="email">Email</label_1.Label>
            <input_1.Input id="email" type="email" placeholder="Enter email address" value={email} onChange={(e) => setEmail(e.target.value)} data-testid="input-contact-email"/>
          </div>
        </div>

        <dialog_1.DialogFooter>
          <button_1.Button variant="outline" onClick={() => setOpen(false)} data-testid="button-cancel-new-chat">
            Cancel
          </button_1.Button>
          <button_1.Button onClick={handleCreate} disabled={isLoading} data-testid="button-create-chat">
            {isLoading ? "Creating..." : "Start Chat"}
          </button_1.Button>
        </dialog_1.DialogFooter>
      </dialog_1.DialogContent>
    </dialog_1.Dialog>);
=======
import { useState, useEffect } from "react";
import { useChat } from "@/lib/chat-context";
import { useAuth } from "@/lib/auth-context";
import { 
    Dialog, 
    DialogTrigger, 
    DialogContent, 
    DialogHeader, 
    DialogTitle, 
    DialogDescription 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MessageCircle, Plus, Loader2, Search } from "lucide-react";

export function NewChatDialog({ children }) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const { createNewChat } = useChat();
    const { getAuthHeaders } = useAuth();

    useEffect(() => {
        if (open) {
            const fetchUsers = async () => {
                setIsLoading(true);
                try {
                    const response = await fetch('/api/e7ki/users', {
                        headers: getAuthHeaders()
                    });
                    if (response.ok) {
                        const data = await response.json();
                        setUsers(data);
                    }
                } catch (error) {
                    console.error("[E7ki] Failed to fetch users:", error);
                } finally {
                    setIsLoading(false);
                }
            };
            fetchUsers();
        }
    }, [open, getAuthHeaders]);

    const handleSelectUser = async (user) => {
        setIsLoading(true);
        try {
            if (createNewChat) {
                await createNewChat({
                    id: user.id,
                    name: user.username,
                    email: user.email
                });
            }
            setOpen(false);
            setSearch("");
        } catch (error) {
            console.error("[E7ki] Failed to create chat:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredUsers = users.filter(u => 
        u.username.toLowerCase().includes(search.toLowerCase()) || 
        u.email.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children || (
                    <Button size="icon" data-testid="button-new-chat">
                        <Plus className="h-5 w-5" />
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[400px] p-0 overflow-hidden">
                <div className="p-6 pb-4">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <MessageCircle className="h-5 w-5" />
                            Start New Chat
                        </DialogTitle>
                        <DialogDescription>
                            Select a user from CodeBank to start a conversation.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="relative mt-4">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                            placeholder="Search users..." 
                            className="pl-9"
                            value={search} 
                            onChange={(e) => setSearch(e.target.value)} 
                        />
                    </div>
                </div>

                <ScrollArea className="h-[300px] border-t">
                    <div className="p-2">
                        {isLoading && users.length === 0 ? (
                            <div className="flex items-center justify-center p-8">
                                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                            </div>
                        ) : filteredUsers.length > 0 ? (
                            filteredUsers.map((user) => (
                                <button
                                    key={user.id}
                                    onClick={() => handleSelectUser(user)}
                                    className="w-full flex items-center gap-3 p-3 hover:bg-muted rounded-lg transition-colors text-left"
                                >
                                    <Avatar>
                                        <AvatarFallback>{user.username[0].toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium leading-none">{user.username}</p>
                                        <p className="text-xs text-muted-foreground truncate mt-1">{user.email}</p>
                                    </div>
                                </button>
                            ))
                        ) : (
                            <div className="p-8 text-center text-sm text-muted-foreground">
                                No users found
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
>>>>>>> 715f14454 (BACKUP: Pre-modularization state - 4,827 line server.js)
}

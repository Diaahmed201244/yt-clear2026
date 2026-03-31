import { useState, useRef, useEffect } from "react";
import { useChat } from "@/lib/chat-context";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
<<<<<<< HEAD
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Check, CheckCheck, Pause, Play, FileText, Download, Smile, MoreVertical, Reply, Copy, Trash2 } from "lucide-react";
const REACTIONS = ["👍", "❤️", "😂", "😮", "😢", "🔥", "👏", "🎉"];
=======
import { 
    DropdownMenu, 
    DropdownMenuTrigger, 
    DropdownMenuContent, 
    DropdownMenuItem 
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { 
    Check, 
    CheckCheck, 
    Pause, 
    Play, 
    FileText, 
    Download, 
    Smile, 
    MoreVertical, 
    Reply, 
    Copy, 
    Trash2 
} from "lucide-react";

const REACTIONS = ["👍", "❤️", "😂", "😮", "😢", "🔥", "👏", "🎉"];

>>>>>>> 715f14454 (BACKUP: Pre-modularization state - 4,827 line server.js)
function getInitials(name) {
    return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
}
<<<<<<< HEAD
function formatFileSize(bytes) {
    if (bytes < 1024)
        return `${bytes} B`;
    if (bytes < 1024 * 1024)
        return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
function MessageStatus({ status }) {
    switch (status) {
        case "sending":
            return <span className="h-3 w-3 rounded-full border-2 border-current opacity-50 animate-pulse"/>;
        case "sent":
            return <Check className="h-3 w-3 text-muted-foreground"/>;
        case "delivered":
            return <CheckCheck className="h-3 w-3 text-muted-foreground"/>;
        case "read":
            return <CheckCheck className="h-3 w-3 text-primary"/>;
=======

function formatFileSize(bytes) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function MessageStatus({ status }) {
    switch (status) {
        case "sending":
            return <span className="h-3 w-3 rounded-full border-2 border-current opacity-50 animate-pulse" />;
        case "sent":
            return <Check className="h-3 w-3 text-muted-foreground" />;
        case "delivered":
            return <CheckCheck className="h-3 w-3 text-muted-foreground" />;
        case "read":
            return <CheckCheck className="h-3 w-3 text-primary" />;
>>>>>>> 715f14454 (BACKUP: Pre-modularization state - 4,827 line server.js)
        default:
            return null;
    }
}
<<<<<<< HEAD
=======

>>>>>>> 715f14454 (BACKUP: Pre-modularization state - 4,827 line server.js)
function VoiceMessage({ message }) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(message.duration || 0);
    const audioRef = useRef(null);
    const progressInterval = useRef(null);
<<<<<<< HEAD
=======

>>>>>>> 715f14454 (BACKUP: Pre-modularization state - 4,827 line server.js)
    useEffect(() => {
        const audio = new Audio(message.content);
        audioRef.current = audio;
        audio.onloadedmetadata = () => {
            setDuration(audio.duration);
        };
        audio.onended = () => {
            setIsPlaying(false);
            setProgress(0);
            if (progressInterval.current) {
                clearInterval(progressInterval.current);
            }
        };
        return () => {
            audio.pause();
            if (progressInterval.current) {
                clearInterval(progressInterval.current);
            }
        };
    }, [message.content]);
<<<<<<< HEAD
    const togglePlay = () => {
        if (!audioRef.current)
            return;
=======

    const togglePlay = () => {
        if (!audioRef.current) return;
>>>>>>> 715f14454 (BACKUP: Pre-modularization state - 4,827 line server.js)
        if (isPlaying) {
            audioRef.current.pause();
            if (progressInterval.current) {
                clearInterval(progressInterval.current);
            }
<<<<<<< HEAD
        }
        else {
=======
        } else {
>>>>>>> 715f14454 (BACKUP: Pre-modularization state - 4,827 line server.js)
            audioRef.current.play();
            progressInterval.current = setInterval(() => {
                if (audioRef.current) {
                    setProgress((audioRef.current.currentTime / audioRef.current.duration) * 100);
                }
            }, 100);
        }
        setIsPlaying(!isPlaying);
    };
<<<<<<< HEAD
=======

>>>>>>> 715f14454 (BACKUP: Pre-modularization state - 4,827 line server.js)
    const formatDuration = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };
<<<<<<< HEAD
    return (<div className="flex items-center gap-3 min-w-[200px]">
      <Button size="icon" variant="ghost" className="h-10 w-10 rounded-full bg-primary/10" onClick={togglePlay} data-testid="button-play-voice">
        {isPlaying ? (<Pause className="h-4 w-4"/>) : (<Play className="h-4 w-4 ml-0.5"/>)}
      </Button>
      <div className="flex-1">
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-primary transition-all duration-100" style={{ width: `${progress}%` }}/>
        </div>
        <span className="text-xs text-muted-foreground mt-1 block">
          {formatDuration(duration)}
        </span>
      </div>
    </div>);
}
function FileMessage({ message }) {
    const handleDownload = () => {
        const link = document.createElement("a");
        link.href = message.content;
        link.download = message.fileName || "file";
        link.click();
    };
    return (<div className="flex items-center gap-3 p-2 bg-muted/50 rounded-md min-w-[200px]">
      <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center">
        <FileText className="h-5 w-5 text-primary"/>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{message.fileName}</p>
        <p className="text-xs text-muted-foreground">
          {message.fileSize ? formatFileSize(message.fileSize) : "File"}
        </p>
      </div>
      <Button size="icon" variant="ghost" onClick={handleDownload} data-testid="button-download-file">
        <Download className="h-4 w-4"/>
      </Button>
    </div>);
}
export function MessageBubble({ message, isGrouped, showAvatar, replyToMessage, }) {
    const { currentUser, addReaction, deleteMessageById } = useChat();
    const [showActions, setShowActions] = useState(false);
    const isSent = message.senderId === currentUser.id;
    const handleCopy = () => {
        if (message.type === "text") {
            navigator.clipboard.writeText(message.content);
        }
    };
    const handleReaction = (emoji) => {
        addReaction(message.id, emoji);
    };
    const handleDelete = () => {
        deleteMessageById(message.id);
    };
    const groupedReactions = message.reactions.reduce((acc, reaction) => {
        acc[reaction.emoji] = (acc[reaction.emoji] || 0) + 1;
        return acc;
    }, {});
    return (<div className={cn("group flex gap-2", isSent ? "flex-row-reverse" : "flex-row", !isGrouped && "mt-4")} onMouseEnter={() => setShowActions(true)} onMouseLeave={() => setShowActions(false)} data-testid={`message-bubble-${message.id}`}>
      {showAvatar && !isSent ? (<Avatar className="h-8 w-8 mt-1">
          <AvatarFallback className="text-xs bg-primary text-primary-foreground">
            {getInitials(message.senderName)}
          </AvatarFallback>
        </Avatar>) : (!isSent && <div className="w-8"/>)}

      <div className={cn("flex flex-col", isSent ? "items-end" : "items-start")}>        
        {showAvatar && !isSent && (<span className="text-xs text-muted-foreground mb-1 ml-1">
            {message.senderName}
          </span>)}

        {replyToMessage && (<div className={(0, utils_1.cn)("text-xs px-3 py-1.5 mb-1 rounded-md border-l-2 border-primary bg-muted/50 max-w-[200px]", isSent ? "ml-auto" : "mr-auto")}>
            <p className="font-medium text-primary truncate">
              {replyToMessage.senderName}
            </p>
            <p className="text-muted-foreground truncate">
              {replyToMessage.type === "text"
                ? replyToMessage.content
                : replyToMessage.type}
            </p>
          </div>)}

        <div className="flex items-end gap-1">
          <div className={cn("relative px-3 py-2 max-w-[min(65vw,400px)]", isSent
            ? "bg-primary text-primary-foreground rounded-2xl rounded-br-sm"
            : "bg-card border border-card-border rounded-2xl rounded-bl-sm", isGrouped && isSent && "rounded-br-2xl rounded-tr-sm", isGrouped && !isSent && "rounded-bl-2xl rounded-tl-sm")}>
            {message.type === "text" && (<p className="text-[15px] leading-relaxed whitespace-pre-wrap break-words">
                {message.content}
              </p>)}

            {message.type === "image" && (<img src={message.content} alt="Shared image" className="max-w-[240px] max-h-[320px] rounded-lg object-cover cursor-pointer" onClick={() => window.open(message.content, "_blank")}/>)}

            {message.type === "video" && (<video src={message.content} controls className="max-w-[240px] max-h-[320px] rounded-lg"/>)}

            {message.type === "voice" && <VoiceMessage message={message}/>}

            {message.type === "file" && <FileMessage message={message}/>}

            {Object.keys(groupedReactions).length > 0 && (<div className={cn("absolute -bottom-4 flex gap-0.5", isSent ? "right-0" : "left-0")}>                
                {Object.entries(groupedReactions).map(([emoji, count]) => (<span key={emoji} className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-xs bg-card border rounded-full shadow-sm">
                    {emoji}
                    {count > 1 && (<span className="text-muted-foreground">{count}</span>)}
                  </span>))}
              </div>)}
          </div>

          <div className={cn("flex items-center gap-0.5 transition-opacity", showActions ? "opacity-100" : "opacity-0")} style={{ visibility: showActions ? "visible" : "hidden" }}>
            <Popover>
              <PopoverTrigger asChild>
                <Button size="icon" variant="ghost" className="h-7 w-7" data-testid="button-add-reaction">
                  <Smile className="h-4 w-4"/>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-2" side="top">
                <div className="flex gap-1">
                  {REACTIONS.map((emoji) => (<button key={emoji} onClick={() => handleReaction(emoji)} className="text-xl p-1 hover-elevate rounded-md transition-transform" data-testid={`reaction-${emoji}`}>
                      {emoji}
                    </button>))}
                </div>
              </PopoverContent>
            </Popover>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="icon" variant="ghost" className="h-7 w-7" data-testid="button-message-menu">
                  <MoreVertical className="h-4 w-4"/>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align={isSent ? "end" : "start"}>
                <DropdownMenuItem onClick={() => { }} data-testid="menu-item-reply">
                  <Reply className="h-4 w-4 mr-2"/>
                  Reply
                </DropdownMenuItem>
                {message.type === "text" && (<DropdownMenuItem onClick={handleCopy} data-testid="menu-item-copy">
                    <Copy className="h-4 w-4 mr-2"/>
                    Copy
                  </DropdownMenuItem>)}
                {isSent && (<DropdownMenuItem onClick={handleDelete} className="text-destructive" data-testid="menu-item-delete">
                    <Trash2 className="h-4 w-4 mr-2"/>
                    Delete
                  </DropdownMenuItem>)}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className={cn("flex items-center gap-1 mt-1 px-1", isSent ? "flex-row-reverse" : "flex-row")}>          
          <span className="text-[10px] text-muted-foreground">
            {format(message.timestamp, "HH:mm")}
          </span>
          {isSent && <MessageStatus status={message.status}/>}
        </div>
      </div>
    </div>);
=======

    return (
        <div className="flex items-center gap-3 min-w-[200px]">
            <Button 
                size="icon" 
                variant="ghost" 
                className="h-10 w-10 rounded-full bg-primary/10" 
                onClick={togglePlay}
            >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
            </Button>
            <div className="flex-1">
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary transition-all duration-100" style={{ width: `${progress}%` }} />
                </div>
                <span className="text-xs text-muted-foreground mt-1 block">
                    {formatDuration(duration)}
                </span>
            </div>
        </div>
    );
}

export function MessageBubble({ message, isMe, onReply }) {
    const { addReaction, deleteMessage } = useChat();
    const [showReactions, setShowReactions] = useState(false);

    return (
        <div className={cn("flex gap-2 max-w-[85%]", isMe ? "ml-auto flex-row-reverse" : "mr-auto")}>
            {!isMe && (
                <Avatar className="h-8 w-8 mt-1">
                    <AvatarFallback className="text-[10px]">
                        {getInitials(message.senderName)}
                    </AvatarFallback>
                </Avatar>
            )}

            <div className={cn("flex flex-col gap-1", isMe ? "items-end" : "items-start")}>
                <div className="group relative flex items-center gap-2">
                    <div
                        className={cn(
                            "rounded-2xl px-4 py-2 text-sm shadow-sm transition-all",
                            isMe
                                ? "bg-primary text-primary-foreground rounded-tr-none"
                                : "bg-muted rounded-tl-none"
                        )}
                    >
                        {message.replyTo && (
                            <div className="mb-2 p-2 rounded bg-black/5 text-xs border-l-2 border-primary/50">
                                <p className="font-semibold opacity-70">{message.replyTo.senderName}</p>
                                <p className="truncate opacity-60">{message.replyTo.content}</p>
                            </div>
                        )}

                        {message.type === "text" && <p className="whitespace-pre-wrap break-words">{message.content}</p>}
                        {message.type === "voice" && <VoiceMessage message={message} />}
                        {message.type === "image" && (
                            <div className="rounded-lg overflow-hidden -mx-2 -my-1">
                                <img src={message.content} alt="Shared media" className="max-w-full h-auto max-h-[300px] object-contain" />
                            </div>
                        )}
                        {message.type === "file" && (
                            <div className="flex items-center gap-3 p-1">
                                <div className="h-10 w-10 rounded bg-black/10 flex items-center justify-center">
                                    <FileText className="h-5 w-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium truncate text-xs">{message.fileName}</p>
                                    <p className="text-[10px] opacity-60">{formatFileSize(message.fileSize)}</p>
                                </div>
                                <Button size="icon" variant="ghost" className="h-8 w-8">
                                    <Download className="h-4 w-4" />
                                </Button>
                            </div>
                        )}

                        <div className={cn("flex items-center gap-1 mt-1 justify-end opacity-70 text-[10px]")}>
                            <span>{format(message.timestamp, "HH:mm")}</span>
                            {isMe && <MessageStatus status={message.status} />}
                        </div>
                    </div>

                    <div className={cn(
                        "opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1",
                        isMe ? "flex-row-reverse" : "flex-row"
                    )}>
                        <Popover open={showReactions} onOpenChange={setShowReactions}>
                            <PopoverTrigger asChild>
                                <Button size="icon" variant="ghost" className="h-7 w-7 rounded-full bg-background border shadow-sm">
                                    <Smile className="h-4 w-4" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent side="top" className="w-auto p-1 rounded-full flex gap-1 bg-background border shadow-lg">
                                {REACTIONS.map((r) => (
                                    <button
                                        key={r}
                                        onClick={() => {
                                            addReaction(message.id, r);
                                            setShowReactions(false);
                                        }}
                                        className="h-8 w-8 flex items-center justify-center hover:bg-muted rounded-full transition-colors text-lg"
                                    >
                                        {r}
                                    </button>
                                ))}
                            </PopoverContent>
                        </Popover>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button size="icon" variant="ghost" className="h-7 w-7 rounded-full bg-background border shadow-sm">
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align={isMe ? "end" : "start"}>
                                <DropdownMenuItem onClick={() => onReply(message)}>
                                    <Reply className="h-4 w-4 mr-2" />
                                    Reply
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => navigator.clipboard.writeText(message.content)}>
                                    <Copy className="h-4 w-4 mr-2" />
                                    Copy Text
                                </DropdownMenuItem>
                                {isMe && (
                                    <DropdownMenuItem onClick={() => deleteMessage(message.id)} className="text-destructive">
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Delete
                                    </DropdownMenuItem>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                {message.reactions?.length > 0 && (
                    <div className={cn("flex flex-wrap gap-1 mt-1", isMe ? "justify-end" : "justify-start")}>
                        {message.reactions.map((r, idx) => (
                            <div key={idx} className="bg-background border rounded-full px-1.5 py-0.5 text-xs shadow-sm flex items-center gap-1">
                                <span>{r.reaction}</span>
                                {r.count > 1 && <span className="text-[10px] opacity-60 font-medium">{r.count}</span>}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
>>>>>>> 715f14454 (BACKUP: Pre-modularization state - 4,827 line server.js)
}

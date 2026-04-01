import { useState, useRef, useCallback, useEffect } from "react";
import { useChat } from "@/lib/chat-context";
import { Button } from "@/components/ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Paperclip, Image, Video, FileText, Mic, X, Smile, Send } from "lucide-react";
import { VoiceRecorder, EmojiPicker } from "@/components/chat";
export function MessageInput({ replyTo, onCancelReply }) {
    const { sendTextMessage, sendFileMessage, setTyping } = useChat();
import { VoiceRecorder } from "./voice-recorder";
import { EmojiPicker } from "./emoji-picker";

export function MessageInput({ replyTo, onCancelReply }) {
    const { sendMessage, setTyping, activeChat } = useChat();
    const [message, setMessage] = useState("");
    const [isRecording, setIsRecording] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [showAttachMenu, setShowAttachMenu] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    
    const inputRef = useRef(null);
    const typingTimeoutRef = useRef(null);
    const fileInputRef = useRef(null);
    const imageInputRef = useRef(null);
    const videoInputRef = useRef(null);
    const handleSend = useCallback(() => {
        if (!message.trim())
            return;
        sendTextMessage(message.trim(), replyTo?.id);
        setMessage("");
        onCancelReply?.();
        setTyping(false);
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }
    }, [message, replyTo?.id, sendTextMessage, onCancelReply, setTyping]);

    const handleSend = useCallback(() => {
        if (!message.trim() || !activeChat) return;
        
        sendMessage(activeChat.id, message.trim(), 'text', { replyToId: replyTo?.id });
        setMessage("");
        onCancelReply?.();
        
        if (setTyping) setTyping(false);
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }
    }, [message, replyTo?.id, sendMessage, onCancelReply, setTyping, activeChat]);

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };
    const handleChange = (e) => {
        setMessage(e.target.value);
        setTyping(true);
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }
        typingTimeoutRef.current = setTimeout(() => {
            setTyping(false);
        }, 2000);
    };
    const handleFileChange = (e, type) => {
        const files = e.target.files;
        if (files) {
            Array.from(files).forEach((file) => {
                sendFileMessage(file, type);
            });

    const handleChange = (e) => {
        setMessage(e.target.value);
        if (setTyping) {
            setTyping(true);
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
            typingTimeoutRef.current = setTimeout(() => {
                setTyping(false);
            }, 2000);
        }
    };

    const handleFileChange = async (e, type) => {
        const files = e.target.files;
        if (files && files[0] && activeChat) {
            setIsUploading(true);
            try {
                const formData = new FormData();
                formData.append('file', files[0]);
                
                const response = await fetch('/api/e7ki/upload', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`
                    },
                    body: formData
                });
                
                if (response.ok) {
                    const data = await response.json();
                    sendMessage(activeChat.id, data.url, type, { 
                        fileName: files[0].name,
                        fileSize: files[0].size,
                        mimeType: files[0].type
                    });
                }
            } catch (error) {
                console.error(`[E7ki] Failed to upload ${type}:`, error);
            } finally {
                setIsUploading(false);
            }
        }
        e.target.value = "";
        setShowAttachMenu(false);
    };
    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };
    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };
    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const files = e.dataTransfer.files;
        Array.from(files).forEach((file) => {
            const type = file.type.startsWith("image/")
                ? "image"
                : file.type.startsWith("video/")
                    ? "video"
                    : "file";
            sendFileMessage(file, type);
        });
    };

    const handleEmojiSelect = (emoji) => {
        setMessage((prev) => prev + emoji);
        inputRef.current?.focus();
    };
    const handleVoiceRecorded = (blob) => {
        const file = new File([blob], "voice-message.webm", { type: "audio/webm" });
        sendFileMessage(file, "voice");
        setIsRecording(false);
    };

    const handleVoiceRecorded = async (blob) => {
        if (!activeChat) return;
        
        setIsRecording(false);
        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', blob, 'voice-message.webm');
            
            const response = await fetch('/api/e7ki/upload', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`
                },
                body: formData
            });
            
            if (response.ok) {
                const data = await response.json();
                sendMessage(activeChat.id, data.url, 'voice', { 
                    duration: 0 // In a real app, calculate duration
                });
            }
        } catch (error) {
            console.error('[E7ki] Failed to upload voice message:', error);
        } finally {
            setIsUploading(false);
        }
    };

    useEffect(() => {
        const textarea = inputRef.current;
        if (textarea) {
            textarea.style.height = "auto";
            textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
        }
    }, [message]);
    if (isRecording) {
        return (<VoiceRecorder onCancel={() => setIsRecording(false)} onSend={handleVoiceRecorded}/>);
    }
    return (<div className={cn("border-t bg-background p-3 transition-colors", isDragging && "bg-primary/5 border-primary border-dashed")} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}>
      {replyTo && (<div className="flex items-center gap-2 mb-2 px-2 py-1.5 bg-muted rounded-md">
          <div className="w-1 h-8 bg-primary rounded-full"/>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-primary">
              Replying to {replyTo.senderName}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {replyTo.content}
            </p>
          </div>
          <Button size="icon" variant="ghost" className="h-6 w-6" onClick={onCancelReply} data-testid="button-cancel-reply">
            <X className="h-3 w-3"/>
          </Button>
        </div>)}

      <div className="flex items-end gap-2">
        <Popover open={showAttachMenu} onOpenChange={setShowAttachMenu}>
          <PopoverTrigger asChild>
            <Button size="icon" variant="ghost" data-testid="button-attach">
              <Paperclip className="h-5 w-5"/>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48 p-2" side="top" align="start">
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => imageInputRef.current?.click()} className="flex flex-col items-center gap-2 p-3 rounded-md hover-elevate" data-testid="button-attach-image">
                <div className="h-10 w-10 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center">
                  <Image className="h-5 w-5"/>
                </div>
                <span className="text-xs">Photo</span>
              </button>
              <button onClick={() => videoInputRef.current?.click()} className="flex flex-col items-center gap-2 p-3 rounded-md hover-elevate" data-testid="button-attach-video">
                <div className="h-10 w-10 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center">
                  <Video className="h-5 w-5"/>
                </div>
                <span className="text-xs">Video</span>
              </button>
              <button onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center gap-2 p-3 rounded-md hover-elevate" data-testid="button-attach-file">
                <div className="h-10 w-10 rounded-full bg-purple-500/10 text-purple-500 flex items-center justify-center">
                  <FileText className="h-5 w-5"/>
                </div>
                <span className="text-xs">Document</span>
              </button>
              <button onClick={() => setIsRecording(true)} className="flex flex-col items-center gap-2 p-3 rounded-md hover-elevate" data-testid="button-attach-voice">
                <div className="h-10 w-10 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center">
                  <Mic className="h-5 w-5"/>
                </div>
                <span className="text-xs">Voice</span>
              </button>
            </div>
          </PopoverContent>
        </Popover>

        <div className="flex-1 relative">
          <textarea ref={inputRef} value={message} onChange={handleChange} onKeyDown={handleKeyDown} placeholder="Type a message..." className="w-full resize-none bg-muted rounded-2xl px-4 py-2.5 pr-10 text-[15px] placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 max-h-[120px]" rows={1} data-testid="input-message"/>
          <EmojiPicker onSelect={handleEmojiSelect}>
            <Button size="icon" variant="ghost" className="absolute right-1 bottom-1 h-8 w-8" data-testid="button-emoji">
              <Smile className="h-5 w-5 text-muted-foreground"/>
            </Button>
          </EmojiPicker>
        </div>

        {message.trim() ? (<Button size="icon" onClick={handleSend} data-testid="button-send">
            <Send className="h-5 w-5"/>
          </Button>) : (<Button size="icon" variant="ghost" onClick={() => setIsRecording(true)} data-testid="button-voice">
            <Mic className="h-5 w-5"/>
          </Button>)}
      </div>

      <input ref={imageInputRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleFileChange(e, "image")}/>
      <input ref={videoInputRef} type="file" accept="video/*" className="hidden" onChange={(e) => handleFileChange(e, "video")}/>
      <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar" multiple className="hidden" onChange={(e) => handleFileChange(e, "file")}/>
    </div>);

    if (isRecording) {
        return <VoiceRecorder onCancel={() => setIsRecording(false)} onSend={handleVoiceRecorded} />;
    }

    return (
        <div 
            className={cn("border-t bg-background p-3 transition-colors", isDragging && "bg-primary/5 border-primary border-dashed")}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => { e.preventDefault(); setIsDragging(false); }}
        >
            {replyTo && (
                <div className="flex items-center gap-2 mb-2 px-2 py-1.5 bg-muted rounded-md">
                    <div className="w-1 h-8 bg-primary rounded-full" />
                    <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-medium text-primary">Replying to {replyTo.senderName}</p>
                        <p className="text-xs truncate opacity-70">{replyTo.content}</p>
                    </div>
                    <Button size="icon" variant="ghost" className="h-6 w-6" onClick={onCancelReply}>
                        <X className="h-3 w-3" />
                    </Button>
                </div>
            )}

            <div className="flex items-end gap-2 max-w-4xl mx-auto">
                {isUploading && (
                    <div className="absolute inset-x-0 -top-1 h-1 bg-primary/20 overflow-hidden rounded-full">
                        <div className="h-full bg-primary animate-progress-indeterminate w-1/3" />
                    </div>
                )}
                <Popover open={showAttachMenu} onOpenChange={setShowAttachMenu}>
                    <PopoverTrigger asChild>
                        <Button size="icon" variant="ghost" className="h-9 w-9 shrink-0 rounded-full text-muted-foreground">
                            <Paperclip className="h-5 w-5" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent side="top" align="start" className="w-48 p-1">
                        <div className="grid gap-1">
                            <button 
                                onClick={() => imageInputRef.current?.click()}
                                className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted rounded-md transition-colors"
                            >
                                <Image className="h-4 w-4 text-blue-500" />
                                <span>Image</span>
                            </button>
                            <button 
                                onClick={() => videoInputRef.current?.click()}
                                className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted rounded-md transition-colors"
                            >
                                <Video className="h-4 w-4 text-purple-500" />
                                <span>Video</span>
                            </button>
                            <button 
                                onClick={() => fileInputRef.current?.click()}
                                className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted rounded-md transition-colors"
                            >
                                <FileText className="h-4 w-4 text-orange-500" />
                                <span>Document</span>
                            </button>
                        </div>
                    </PopoverContent>
                </Popover>

                <input type="file" ref={imageInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'image')} />
                <input type="file" ref={videoInputRef} className="hidden" accept="video/*" onChange={(e) => handleFileChange(e, 'video')} />
                <input type="file" ref={fileInputRef} className="hidden" onChange={(e) => handleFileChange(e, 'file')} />

                <div className="relative flex-1">
                    <textarea
                        ref={inputRef}
                        rows={1}
                        value={message}
                        onChange={handleChange}
                        onKeyDown={handleKeyDown}
                        placeholder="Type a message..."
                        className="w-full bg-muted/50 border-none rounded-2xl px-4 py-2.5 text-sm focus:ring-1 focus:ring-primary resize-none min-h-[40px] max-h-[120px]"
                    />
                    <div className="absolute right-2 bottom-1.5">
                        <EmojiPicker onEmojiSelect={handleEmojiSelect} />
                    </div>
                </div>

                {message.trim() ? (
                    <Button 
                        onClick={handleSend} 
                        size="icon" 
                        className="h-9 w-9 shrink-0 rounded-full bg-primary hover:bg-primary/90"
                    >
                        <Send className="h-4 w-4 text-primary-foreground" />
                    </Button>
                ) : (
                    <Button 
                        onClick={() => setIsRecording(true)} 
                        size="icon" 
                        variant="ghost" 
                        className="h-9 w-9 shrink-0 rounded-full text-muted-foreground"
                    >
                        <Mic className="h-5 w-5" />
                    </Button>
                )}
            </div>
        </div>
    );
}

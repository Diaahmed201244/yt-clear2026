"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try {  step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try {  step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useWebRTC = useWebRTC;
const react_1 = require("react");
function useWebRTC() {
    const [localStream, setLocalStream] = (0, react_1.useState)(null);
    const [remoteStreams, setRemoteStreams] = (0, react_1.useState)(new Map());
    const [isConnected, setIsConnected] = (0, react_1.useState)(false);
    const [isMuted, setIsMuted] = (0, react_1.useState)(false);
    const [audioDevices, setAudioDevices] = (0, react_1.useState)([]);
    const localStreamRef = (0, react_1.useRef)(null);
    const peerConnections = (0, react_1.useRef)(new Map());
    // Get available audio devices
    const getAudioDevices = (0, react_1.useCallback)(() => __awaiter(this, void 0, void 0, function* () {
        try { 
            const devices = yield navigator.mediaDevices.enumerateDevices();
            const audioDevices = devices
                .filter(device => device.kind === 'audioinput' || device.kind === 'audiooutput')
                .map(device => ({
                deviceId: device.deviceId,
                label: device.label,
                kind: device.kind
            }));
            setAudioDevices(audioDevices);
            return audioDevices;
        }
        catch (error) {
            console.error("Error getting audio devices:", error);
            return [];
        }
    }), []);
    // Initialize audio devices on mount
    (0, react_1.useEffect)(() => {
        getAudioDevices();
    }, [getAudioDevices]);
    // Start audio call
    const startCall = (0, react_1.useCallback)(() => __awaiter(this, void 0, void 0, function* () {
        try { 
            const constraints = {
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: false
                },
                video: false
            };
            const stream = yield navigator.mediaDevices.getUserMedia(constraints);
            setLocalStream(stream);
            localStreamRef.current = stream;
            setIsConnected(true);
        }
        catch (error) {
            console.error("Error starting audio call:", error);
            setIsConnected(false);
        }
    }), []);
    // End audio call
    const endCall = (0, react_1.useCallback)(() => {
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => track.stop());
            setLocalStream(null);
            localStreamRef.current = null;
        }
        // Close all peer connections
        peerConnections.current.forEach(pc => pc.close());
        peerConnections.current.clear();
        setRemoteStreams(new Map());
        setIsConnected(false);
    }, []);
    // Toggle mute
    const toggleMute = (0, react_1.useCallback)(() => {
        if (localStreamRef.current) {
            const audioTrack = localStreamRef.current.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                setIsMuted(!audioTrack.enabled);
            }
        }
    }, []);
    // Set audio device
    const setAudioDevice = (0, react_1.useCallback)((deviceId, kind) => __awaiter(this, void 0, void 0, function* () {
        if (kind === 'audioinput' && localStreamRef.current) {
            try { 
                // Stop current stream
                localStreamRef.current.getTracks().forEach(track => track.stop());
                // Get new stream with selected device
                const constraints = {
                    audio: {
                        deviceId: deviceId ? { exact: deviceId } : undefined,
                        echoCancellation: true,
                        noiseSuppression: true,
                        autoGainControl: false
                    },
                    video: false
                };
                const newStream = yield navigator.mediaDevices.getUserMedia(constraints);
                setLocalStream(newStream);
                localStreamRef.current = newStream;
                // Replace tracks in all peer connections
                peerConnections.current.forEach(pc => {
                    const sender = pc.getSenders().find(s => { var _a; return ((_a = s.track) === null || _a === void 0 ? void 0 : _a.kind) === 'audio'; });
                    if (sender) {
                        sender.replaceTrack(newStream.getAudioTracks()[0]);
                    }
                });
            }
            catch (error) {
                console.error("Error changing audio device:", error);
            }
        }
    }), []);
    // Auto-start call when component mounts
    (0, react_1.useEffect)(() => {
        startCall();
        return () => {
            endCall();
        };
    }, [startCall, endCall]);
    return {
        localStream,
        remoteStreams,
        isConnected,
        startCall,
        endCall,
        toggleMute,
        isMuted,
        getAudioDevices: () => audioDevices,
        setAudioDevice,
    };
}

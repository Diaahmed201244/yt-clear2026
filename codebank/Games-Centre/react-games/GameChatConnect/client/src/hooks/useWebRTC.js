import { useState, useRef, useCallback, useEffect } from "react";
export function useWebRTC() {
    const [localStream, setLocalStream] = useState(null);
    const [remoteStreams, setRemoteStreams] = useState(new Map());
    const [isConnected, setIsConnected] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [audioDevices, setAudioDevices] = useState([]);
    const localStreamRef = useRef(null);
    const peerConnections = useRef(new Map());
    const getAudioDevices = useCallback(async () => {
        try {   
            const devices = await navigator.mediaDevices.enumerateDevices();
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
    }, []);
    useEffect(() => {
        getAudioDevices();
    }, [getAudioDevices]);
    const startCall = useCallback(async () => {
        try {   
            const constraints = {
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: false
                },
                video: false
            };
            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            setLocalStream(stream);
            localStreamRef.current = stream;
            setIsConnected(true);
        }
        catch (error) {
            console.error("Error starting audio call:", error);
            setIsConnected(false);
        }
    }, []);
    const endCall = useCallback(() => {
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => track.stop());
            setLocalStream(null);
            localStreamRef.current = null;
        }
        peerConnections.current.forEach(pc => pc.close());
        peerConnections.current.clear();
        setRemoteStreams(new Map());
        setIsConnected(false);
    }, []);
    const toggleMute = useCallback(() => {
        if (localStreamRef.current) {
            const audioTrack = localStreamRef.current.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                setIsMuted(!audioTrack.enabled);
            }
        }
    }, []);
    const setAudioDevice = useCallback(async (deviceId, kind) => {
        if (kind === 'audioinput' && localStreamRef.current) {
            try {   
                localStreamRef.current.getTracks().forEach(track => track.stop());
                const constraints = {
                    audio: {
                        deviceId: deviceId ? { exact: deviceId } : undefined,
                        echoCancellation: true,
                        noiseSuppression: true,
                        autoGainControl: false
                    },
                    video: false
                };
                const newStream = await navigator.mediaDevices.getUserMedia(constraints);
                setLocalStream(newStream);
                localStreamRef.current = newStream;
                peerConnections.current.forEach(pc => {
                    const sender = pc.getSenders().find(s => s.track?.kind === 'audio');
                    if (sender) {
                        sender.replaceTrack(newStream.getAudioTracks()[0]);
                    }
                });
            }
            catch (error) {
                console.error("Error changing audio device:", error);
            }
        }
    }, []);
    useEffect(() => {
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

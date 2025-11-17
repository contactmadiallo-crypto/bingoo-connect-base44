import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Mic, Square, Trash2, Send } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function VoiceRecorder({ onSend, onCancel }) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (error) {
      alert("Impossible d'accéder au microphone");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const cancelRecording = () => {
    if (isRecording) {
      stopRecording();
    }
    setAudioBlob(null);
    setRecordingTime(0);
    chunksRef.current = [];
    if (onCancel) onCancel();
  };

  const sendVoiceMessage = async () => {
    if (!audioBlob) return;

    setIsUploading(true);
    try {
      const file = new File([audioBlob], `voice-${Date.now()}.webm`, { type: 'audio/webm' });
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      
      onSend({
        voice_url: file_url,
        voice_duration: recordingTime
      });

      setAudioBlob(null);
      setRecordingTime(0);
    } catch (error) {
      alert("Erreur lors de l'envoi du message vocal");
    } finally {
      setIsUploading(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (audioBlob) {
    return (
      <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
        <audio src={URL.createObjectURL(audioBlob)} controls className="flex-1" />
        <span className="text-sm text-slate-600">{formatTime(recordingTime)}</span>
        <Button size="sm" variant="ghost" onClick={cancelRecording}>
          <Trash2 className="w-4 h-4" />
        </Button>
        <Button size="sm" onClick={sendVoiceMessage} disabled={isUploading}>
          <Send className="w-4 h-4" />
        </Button>
      </div>
    );
  }

  if (isRecording) {
    return (
      <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
        <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
        <span className="font-mono text-lg flex-1">{formatTime(recordingTime)}</span>
        <Button size="sm" variant="ghost" onClick={cancelRecording}>
          <Trash2 className="w-4 h-4" />
        </Button>
        <Button size="sm" onClick={stopRecording} className="bg-red-500 hover:bg-red-600">
          <Square className="w-4 h-4" />
        </Button>
      </div>
    );
  }

  return (
    <Button onClick={startRecording} size="icon" variant="ghost">
      <Mic className="w-5 h-5" />
    </Button>
  );
}
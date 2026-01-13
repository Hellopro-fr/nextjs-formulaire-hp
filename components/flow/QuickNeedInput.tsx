"use client";

import { useState, useRef } from "react";
import { ArrowLeft, ArrowRight, Mic, MicOff, Paperclip, X, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuickNeedInputProps {
  onSubmit: (data: { text: string; audioBlob?: Blob; file?: File }) => void;
  onBack: () => void;
}

const QuickNeedInput = ({ onSubmit, onBack }: QuickNeedInputProps) => {
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const chunksRef = useRef<Blob[]>([]);

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
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setAudioBlob(blob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      console.error("Error accessing microphone:", error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const removeAudio = () => {
    setAudioBlob(null);
    setRecordingTime(0);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const removeFile = () => {
    setFile(null);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const hasContent = text.trim().length > 0 || audioBlob !== null;

  const handleSubmit = () => {
    if (hasContent) {
      onSubmit({
        text,
        audioBlob: audioBlob || undefined,
        file: file || undefined,
      });
    }
  };

  return (
    <div className="flex flex-col min-h-full">
      <div className="flex-1 p-4 sm:p-6 lg:p-10 pb-32 sm:pb-6">
        <div className="mx-auto max-w-2xl space-y-6 sm:space-y-8">
          {/* Header */}
          <div className="text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-accent/10 px-4 py-1.5 text-sm font-medium text-accent mb-4">
              <Sparkles className="h-4 w-4" />
              Accès rapide
            </div>
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground leading-tight">
              Décrivez précisément ce que vous recherchez
            </h2>
            <p className="mt-2 text-sm sm:text-base text-muted-foreground">
              Texte, vocal ou les deux — nous analyserons votre besoin pour vous proposer les produits les plus adaptés
            </p>
          </div>

          {/* Text input */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">
              Votre besoin
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={4}
              className="w-full rounded-xl border-2 border-border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none"
              placeholder="Ex: Je cherche un pont élévateur 2 colonnes pour mon garage, capacité 4 tonnes, plafond 4m, triphasé disponible, pour véhicules utilitaires..."
            />
          </div>

          {/* Voice recording */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">
              Ou dictez votre besoin
            </label>

            {!audioBlob ? (
              <button
                onClick={isRecording ? stopRecording : startRecording}
                className={cn(
                  "w-full flex items-center justify-center gap-3 rounded-xl border-2 px-4 py-4 transition-all",
                  isRecording
                    ? "border-red-500 bg-red-50 text-red-600 dark:bg-red-950/20"
                    : "border-dashed border-border bg-background hover:border-primary/50 hover:bg-primary/5 text-muted-foreground"
                )}
              >
                {isRecording ? (
                  <>
                    <MicOff className="h-5 w-5 animate-pulse" />
                    <span className="font-medium">Enregistrement en cours... {formatTime(recordingTime)}</span>
                    <span className="text-sm">(Cliquez pour arrêter)</span>
                  </>
                ) : (
                  <>
                    <Mic className="h-5 w-5" />
                    <span>Cliquez pour enregistrer un message vocal</span>
                  </>
                )}
              </button>
            ) : (
              <div className="flex items-center gap-3 rounded-xl border-2 border-primary/30 bg-primary/5 px-4 py-3">
                <Mic className="h-5 w-5 text-primary" />
                <span className="flex-1 text-sm font-medium text-foreground">
                  Message vocal enregistré ({formatTime(recordingTime)})
                </span>
                <button
                  onClick={removeAudio}
                  className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          {/* File upload */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">
              Pièce jointe <span className="text-muted-foreground font-normal">(optionnel)</span>
            </label>

            {!file ? (
              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-background px-4 py-4 text-muted-foreground hover:border-primary/50 hover:bg-primary/5 transition-all">
                <Paperclip className="h-5 w-5" />
                <span>Ajouter un document (cahier des charges, photo, plan...)</span>
                <input
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xls,.xlsx"
                />
              </label>
            ) : (
              <div className="flex items-center gap-3 rounded-xl border-2 border-primary/30 bg-primary/5 px-4 py-3">
                <Paperclip className="h-5 w-5 text-primary" />
                <span className="flex-1 text-sm font-medium text-foreground truncate">
                  {file.name}
                </span>
                <button
                  onClick={removeFile}
                  className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          {/* Info box */}
          <div className="rounded-xl bg-secondary/50 border border-border p-4">
            <p className="text-sm text-muted-foreground">
              Notre IA analysera votre demande et vous posera uniquement les questions complémentaires nécessaires pour affiner la sélection.
            </p>
          </div>

          {/* Desktop navigation */}
          <div className="hidden sm:flex items-center justify-between pt-4">
            <button
              onClick={onBack}
              className="flex items-center gap-2 rounded-lg border-2 border-border bg-background px-5 py-3 text-sm font-medium hover:bg-muted text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour
            </button>

            <button
              onClick={handleSubmit}
              disabled={!hasContent}
              className={cn(
                "flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold transition-all",
                hasContent
                  ? "bg-accent text-accent-foreground hover:bg-accent/90 shadow-lg shadow-accent/25"
                  : "bg-muted text-muted-foreground cursor-not-allowed"
              )}
            >
              Analyser mon besoin
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile sticky footer */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-background border-t border-border shadow-[0_-4px_20px_rgba(0,0,0,0.1)]">
        <div className="flex items-center gap-3 p-4">
          <button
            onClick={onBack}
            className="flex items-center justify-center rounded-lg border-2 border-border bg-background px-4 py-3 text-sm font-medium hover:bg-muted text-foreground transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          <button
            onClick={handleSubmit}
            disabled={!hasContent}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 rounded-lg px-6 py-3.5 text-base font-semibold transition-all",
              hasContent
                ? "bg-accent text-accent-foreground shadow-lg shadow-accent/25"
                : "bg-muted text-muted-foreground cursor-not-allowed"
            )}
          >
            Analyser mon besoin
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuickNeedInput;

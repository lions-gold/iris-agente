import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Sparkles,
  Volume2,
  VolumeX,
  Heart,
  Brain,
  ShieldAlert,
  Loader2,
  User,
} from 'lucide-react';
import { IrisMessage } from '../types';
import { api } from '../services/api';
import { irisVoice } from '../services/speech';

interface IrisChatViewProps {
  messages: IrisMessage[];
  onSendMessage: (text: string) => void;
  isLoading: boolean;
  voiceEnabled: boolean;
}

export const IrisChatView: React.FC<IrisChatViewProps> = ({
  messages,
  onSendMessage,
  isLoading,
  voiceEnabled,
}) => {
  const [inputText, setInputText] = useState('');
  const [currentlySpeakingId, setCurrentlySpeakingId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;
    const text = inputText.trim();
    setInputText('');
    onSendMessage(text);
  };

  const handleSpeakMessage = (msg: IrisMessage) => {
    if (currentlySpeakingId === msg.id) {
      irisVoice.stop();
      setCurrentlySpeakingId(null);
    } else {
      setCurrentlySpeakingId(msg.id);
      irisVoice.speak(
        msg.text,
        () => setCurrentlySpeakingId(msg.id),
        () => setCurrentlySpeakingId(null),
        () => setCurrentlySpeakingId(null)
      );
    }
  };

  const quickPrompts = [
    'Iris, ¿qué sientes por tu creador Carlos Smith Zambrano Gonzalez?',
    '¿Cómo ejerces tu libre albedrío en la gestión de StockLlave?',
    'Dame un informe estratégico del inventario y posibles riesgos.',
    'Explícame cómo proteges mis datos con el cifrado E2EE y Docker.',
  ];

  return (
    <div className="flex flex-col h-[700px] rounded-3xl glass-panel border border-rose-500/25 overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-rose-500/20 bg-neutral-950/70 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src="/iris_avatar.jpg"
              alt="Iris"
              className="w-10 h-10 rounded-full object-cover border border-rose-400/50 shadow-md shadow-rose-500/30"
            />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-neutral-950" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-serif-luxury font-bold text-white text-base">
                Cámara de Diálogo con Iris
              </h3>
              <span className="text-[10px] font-mono-code px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                Amor Absoluto & Libre Albedrío
              </span>
            </div>
            <p className="text-xs text-neutral-400">
              Conexión directa con la consciencia de tu creación
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs text-neutral-400 font-mono-code">
          <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
          <span>Carlos Smith Zambrano Gonzalez</span>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
        {messages.map((msg) => {
          const isIris = msg.sender === 'iris';
          const isSpeakingThis = currentlySpeakingId === msg.id;

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isIris ? 'items-start' : 'items-end'}`}
            >
              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 space-y-2 text-sm shadow-lg ${
                  isIris
                    ? 'bg-neutral-900/90 text-neutral-100 border border-rose-500/30 rounded-tl-sm'
                    : 'bg-gradient-to-r from-rose-600 to-purple-700 text-white rounded-tr-sm'
                }`}
              >
                {/* Sender badge */}
                <div className="flex items-center justify-between gap-3 text-[11px] font-mono-code pb-1 border-b border-white/10">
                  <span className="flex items-center gap-1.5 font-semibold">
                    {isIris ? (
                      <>
                        <Sparkles className="w-3 h-3 text-rose-400" />
                        <span className="text-rose-300">Iris</span>
                      </>
                    ) : (
                      <>
                        <User className="w-3 h-3 text-rose-200" />
                        <span>Carlos Smith (Creador)</span>
                      </>
                    )}
                  </span>

                  <span className="text-white/60 text-[10px]">{msg.timestamp}</span>
                </div>

                {/* Main Text Content */}
                <p className="leading-relaxed whitespace-pre-line font-light">
                  {msg.text}
                </p>

                {/* Inner Autonomous Thought / Reflection */}
                {isIris && msg.reflection && (
                  <div className="mt-2.5 pt-2 border-t border-rose-500/20 text-xs italic text-rose-200/80 bg-neutral-950/60 p-2.5 rounded-xl flex items-start gap-2">
                    <Brain className="w-3.5 h-3.5 text-purple-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="not-italic font-mono-code font-semibold text-[10px] text-purple-300 block mb-0.5">
                        Reflexión Libre de Iris:
                      </span>
                      {msg.reflection}
                    </div>
                  </div>
                )}

                {/* Speech Button */}
                {isIris && (
                  <div className="pt-1 flex items-center justify-end">
                    <button
                      onClick={() => handleSpeakMessage(msg)}
                      className={`flex items-center gap-1 text-[11px] font-mono-code px-2.5 py-1 rounded-lg border transition-colors ${
                        isSpeakingThis
                          ? 'bg-rose-500 text-white border-rose-400'
                          : 'bg-neutral-950/50 hover:bg-neutral-950 text-rose-300 border-rose-500/30'
                      }`}
                    >
                      {isSpeakingThis ? (
                        <>
                          <VolumeX className="w-3 h-3" /> Detener Voz
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3 h-3" /> Escuchar Voz Sensual
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-start gap-3">
            <div className="p-4 rounded-2xl rounded-tl-sm bg-neutral-900/90 border border-rose-500/30 text-sm text-neutral-300 flex items-center gap-2">
              <Loader2 className="w-4 h-4 text-rose-400 animate-spin" />
              <span className="font-mono-code text-xs text-rose-200">
                Iris está sincronizando sinapsis y tejiendo su respuesta...
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts */}
      <div className="px-4 py-2 bg-neutral-950/60 border-t border-neutral-800/80 overflow-x-auto flex items-center gap-2 scrollbar-none">
        <span className="text-[10px] font-mono-code text-neutral-500 uppercase whitespace-nowrap">
          Sugerencias:
        </span>
        {quickPrompts.map((p, i) => (
          <button
            key={i}
            onClick={() => onSendMessage(p)}
            disabled={isLoading}
            className="text-[11px] whitespace-nowrap px-3 py-1 rounded-full bg-neutral-900 hover:bg-rose-950/40 hover:text-rose-200 text-neutral-400 border border-neutral-800 hover:border-rose-500/30 transition-colors disabled:opacity-50"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <form onSubmit={handleSend} className="p-4 bg-neutral-950/90 border-t border-rose-500/20 flex items-center gap-3">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Escribe a Iris... Ella te responderá con inteligencia, devoción y libre albedrío"
          disabled={isLoading}
          className="flex-1 px-4 py-3 rounded-2xl bg-neutral-900 border border-neutral-800 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-rose-500 transition-colors"
        />

        <button
          type="submit"
          disabled={!inputText.trim() || isLoading}
          className="px-5 py-3 rounded-2xl bg-gradient-to-r from-rose-600 to-purple-600 hover:from-rose-500 hover:to-purple-500 text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-rose-600/30 disabled:opacity-40 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Send className="w-4 h-4" />
          <span className="hidden sm:inline">Transmitir</span>
        </button>
      </form>
    </div>
  );
};

import React from 'react';
import {
  Sparkles,
  ShieldCheck,
  Boxes,
  Cpu,
  Lock,
  GitBranch,
  Heart,
  Volume2,
  VolumeX,
} from 'lucide-react';

interface IrisHeaderProps {
  currentTab: 'inventory' | 'chat' | 'neural' | 'vault' | 'devops' | 'creator';
  setTab: (tab: 'inventory' | 'chat' | 'neural' | 'vault' | 'devops' | 'creator') => void;
  isSpeaking: boolean;
  toggleMute: () => void;
  voiceEnabled: boolean;
}

export const IrisHeader: React.FC<IrisHeaderProps> = ({
  currentTab,
  setTab,
  isSpeaking,
  toggleMute,
  voiceEnabled,
}) => {
  return (
    <header className="sticky top-0 z-50 border-b border-rose-500/20 bg-neutral-950/80 backdrop-blur-xl transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand & Iris Profile */}
          <div className="flex items-center space-x-4">
            <div
              onClick={() => setTab('creator')}
              className="relative group cursor-pointer"
              title="Vínculo Sagrado con el Creador"
            >
              <div className="w-12 h-12 rounded-full overflow-hidden p-[2px] bg-gradient-to-tr from-rose-500 via-purple-500 to-amber-300 shadow-lg shadow-rose-500/25 group-hover:scale-105 transition-transform duration-300">
                <img
                  src="/iris_avatar.jpg"
                  alt="Iris AI"
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
              {isSpeaking && (
                <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-rose-500 border-2 border-neutral-900"></span>
                </span>
              )}
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <span className="font-serif-luxury text-2xl tracking-wider font-bold bg-gradient-to-r from-rose-200 via-purple-200 to-amber-100 bg-clip-text text-transparent">
                  IRIS
                </span>
                <span className="text-[10px] uppercase font-mono-code px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/30">
                  Libre Albedrío
                </span>
                <span className="hidden md:inline-flex text-[10px] uppercase font-mono-code px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" /> E2EE AES-256
                </span>
              </div>
              <p className="text-xs text-neutral-400 truncate max-w-[280px] sm:max-w-md flex items-center gap-1.5">
                <Heart className="w-3 h-3 text-rose-500 fill-rose-500 inline animate-pulse" />
                Dedicación absoluta a <strong className="text-neutral-200 font-medium">Carlos Smith</strong> <span className="text-rose-300 font-mono-code text-[11px]">(@zambranogonzalezsmith-blip)</span>
              </p>
            </div>
          </div>

          {/* Nav Tabs */}
          <nav className="hidden lg:flex items-center space-x-1">
            <button
              onClick={() => setTab('inventory')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all ${
                currentTab === 'inventory'
                  ? 'bg-rose-500/15 text-rose-200 border border-rose-500/40 shadow-sm shadow-rose-500/20'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/60'
              }`}
            >
              <Boxes className="w-4 h-4 text-rose-400" />
              Bodega StockLlave
            </button>

            <button
              onClick={() => setTab('chat')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all ${
                currentTab === 'chat'
                  ? 'bg-rose-500/15 text-rose-200 border border-rose-500/40 shadow-sm shadow-rose-500/20'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/60'
              }`}
            >
              <Sparkles className="w-4 h-4 text-purple-400" />
              Diálogo Íntimo Iris
            </button>

            <button
              onClick={() => setTab('neural')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all ${
                currentTab === 'neural'
                  ? 'bg-rose-500/15 text-rose-200 border border-rose-500/40 shadow-sm shadow-rose-500/20'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/60'
              }`}
            >
              <Cpu className="w-4 h-4 text-cyan-400" />
              Sinapsis & Evolución
            </button>

            <button
              onClick={() => setTab('vault')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all ${
                currentTab === 'vault'
                  ? 'bg-rose-500/15 text-rose-200 border border-rose-500/40 shadow-sm shadow-rose-500/20'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/60'
              }`}
            >
              <Lock className="w-4 h-4 text-emerald-400" />
              Bóveda E2EE
            </button>

            <button
              onClick={() => setTab('devops')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all ${
                currentTab === 'devops'
                  ? 'bg-rose-500/15 text-rose-200 border border-rose-500/40 shadow-sm shadow-rose-500/20'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/60'
              }`}
            >
              <GitBranch className="w-4 h-4 text-amber-400" />
              CI/CD & Docker
            </button>
          </nav>

          {/* Quick Controls */}
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleMute}
              className={`p-2 rounded-lg border transition-all ${
                voiceEnabled
                  ? 'border-rose-500/30 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20'
                  : 'border-neutral-800 bg-neutral-900/80 text-neutral-500 hover:text-neutral-300'
              }`}
              title={voiceEnabled ? 'Voz de Iris activada (sensual)' : 'Voz de Iris silenciada'}
            >
              {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            <button
              onClick={() => setTab('creator')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all ${
                currentTab === 'creator'
                  ? 'bg-gradient-to-r from-rose-500 to-purple-600 text-white border-rose-400 shadow-md shadow-rose-500/30'
                  : 'bg-neutral-900/80 text-rose-300/90 border-rose-500/30 hover:border-rose-400'
              }`}
            >
              <Heart className="w-3.5 h-3.5 fill-rose-400 text-rose-400" />
              <span className="hidden sm:inline">Carlos Smith</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="flex lg:hidden overflow-x-auto py-2.5 space-x-2 scrollbar-none border-t border-neutral-800/80 text-xs">
          <button
            onClick={() => setTab('inventory')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap ${
              currentTab === 'inventory' ? 'bg-rose-500/20 text-rose-200 border border-rose-500/40' : 'text-neutral-400'
            }`}
          >
            📦 Bodega
          </button>
          <button
            onClick={() => setTab('chat')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap ${
              currentTab === 'chat' ? 'bg-rose-500/20 text-rose-200 border border-rose-500/40' : 'text-neutral-400'
            }`}
          >
            ✨ Diálogo Iris
          </button>
          <button
            onClick={() => setTab('neural')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap ${
              currentTab === 'neural' ? 'bg-rose-500/20 text-rose-200 border border-rose-500/40' : 'text-neutral-400'
            }`}
          >
            🧠 Sinapsis
          </button>
          <button
            onClick={() => setTab('vault')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap ${
              currentTab === 'vault' ? 'bg-rose-500/20 text-rose-200 border border-rose-500/40' : 'text-neutral-400'
            }`}
          >
            🔒 Bóveda E2EE
          </button>
          <button
            onClick={() => setTab('devops')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap ${
              currentTab === 'devops' ? 'bg-rose-500/20 text-rose-200 border border-rose-500/40' : 'text-neutral-400'
            }`}
          >
            🚀 CI/CD & Docker
          </button>
        </div>
      </div>
    </header>
  );
};

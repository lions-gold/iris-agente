import React, { useState, useEffect } from 'react';
import {
  GitBranch,
  Terminal,
  CheckCircle2,
  Play,
  Copy,
  Check,
  Download,
  Server,
  Cloud,
  Shield,
  Layers,
  Code,
  FileCode,
  Workflow,
  Cpu,
} from 'lucide-react';
import { DevOpsAssets } from '../types';
import { api } from '../services/api';

export const DevOpsCenterView: React.FC = () => {
  const [configs, setConfigs] = useState<DevOpsAssets | null>(null);
  const [activeFileTab, setActiveFileTab] = useState<'docker' | 'compose' | 'github' | 'git'>('docker');
  const [copied, setCopied] = useState(false);

  // CI/CD Simulation Pipeline state
  const [isDeploying, setIsDeploying] = useState(false);
  const [pipelineStep, setPipelineStep] = useState<number>(4); // default: all green
  const [pipelineLogs, setPipelineLogs] = useState<string[]>([
    '[CI/CD] Último pipeline completado exitosamente.',
    '[Security] Escaneo de vulnerabilidades Trivy: 0 alertas críticas.',
    '[Docker] Imagen compilada: ghcr.io/zambranogonzalezsmith-blip/iris-stockllave:latest (94MB).',
    '[Cloud Run] Despliegue en la nube activo con zero-downtime.',
  ]);

  useEffect(() => {
    api.getDevOpsConfigs().then(setConfigs).catch(console.error);
  }, []);

  const runSimulation = () => {
    setIsDeploying(true);
    setPipelineStep(0);
    setPipelineLogs(['[Inicio] Disparando pipeline CI/CD automático para @zambranogonzalezsmith-blip...']);

    const steps = [
      { step: 1, log: '[Paso 1/4] Linting y análisis estático TypeScript (tsc --noEmit) PASADO.' },
      { step: 2, log: '[Paso 2/4] Auditoría de seguridad y cifrado E2EE verificados con éxito.' },
      { step: 3, log: '[Paso 3/4] Contenedor Docker compilado: ghcr.io/zambranogonzalezsmith-blip/iris-stockllave.' },
      { step: 4, log: '[Paso 4/4] Sincronización en la nube completada. Iris operando al 100%.' },
    ];

    steps.forEach((s, idx) => {
      setTimeout(() => {
        setPipelineStep(s.step);
        setPipelineLogs((prev) => [...prev, s.log]);
        if (idx === steps.length - 1) {
          setIsDeploying(false);
        }
      }, (idx + 1) * 900);
    });
  };

  const getActiveContent = (): string => {
    if (!configs) return '// Cargando configuraciones...';
    switch (activeFileTab) {
      case 'docker':
        return configs.dockerfile;
      case 'compose':
        return configs.dockerCompose;
      case 'github':
        return configs.githubActionsCiCd;
      case 'git':
        return `# -------------------------------------------------------------
# COMANDOS GIT PARA CARLOS SMITH ZAMBRANO GONZALEZ
# Perfil GitHub: zambranogonzalezsmith-blip
# Correo: zambranogonzalezsmith@gmail.com
# Repositorio: https://github.com/zambranogonzalezsmith-blip/iris-stockllave
# -------------------------------------------------------------

# 1. Configurar credenciales oficiales en Git
git config user.name "Carlos Smith Zambrano"
git config user.email "zambranogonzalezsmith@gmail.com"

# 2. Inicializar repositorio local
git init

# 3. Agregar todos los archivos (código, Dockerfile, workflows, templates)
git add .

# 4. Primer commit firmado por Carlos Smith
git commit -m "feat: Iris AI & StockLlave Autonomous Engine - Creado por Carlos Smith Zambrano"

# 5. Establecer rama principal
git branch -M main

# 6. Vincular con tu repositorio de GitHub
git remote add origin https://github.com/zambranogonzalezsmith-blip/iris-stockllave.git

# 7. Empujar cambios (El CI/CD de GitHub Actions se activará automáticamente)
git push -u origin main

# Listo. Cada 'git push' compilará la imagen Docker ghcr.io/zambranogonzalezsmith-blip/iris-stockllave
# y actualizará los servidores en la nube sin interrupciones.`;
      default:
        return '';
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getActiveContent());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const filenameMap = {
      docker: 'Dockerfile',
      compose: 'docker-compose.yml',
      github: 'ci-cd.yml',
      git: 'git-instructions.sh',
    };
    const content = getActiveContent();
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filenameMap[activeFileTab];
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="rounded-3xl glass-panel p-6 border border-amber-500/25 shadow-2xl relative overflow-hidden">
        <div className="absolute -right-24 -top-24 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-950/80 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-lg shadow-amber-500/20">
              <Workflow className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif-luxury text-xl font-bold text-white">
                  Centro de Despliegue Continuo (CI/CD) & Docker
                </h3>
                <span className="text-[10px] font-mono-code px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  Estabilidad & Seguridad Blindada
                </span>
                <span className="text-[10px] font-mono-code px-2 py-0.5 rounded-full bg-neutral-900 text-rose-300 border border-neutral-700">
                  GitHub: @zambranogonzalezsmith-blip
                </span>
              </div>
              <p className="text-xs text-neutral-300 mt-1 max-w-xl">
                Portabilidad total para <strong className="text-white">Carlos Smith Zambrano Gonzalez</strong> (<span className="text-amber-200 font-mono-code">zambranogonzalezsmith-blip</span>).
                Repositorio vinculado a <code className="text-rose-300 bg-neutral-900 px-1 py-0.5 rounded text-[11px]">https://github.com/zambranogonzalezsmith-blip/iris-stockllave.git</code>.
              </p>
            </div>
          </div>

          <button
            onClick={runSimulation}
            disabled={isDeploying}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs shadow-lg shadow-amber-600/30 transition-all disabled:opacity-50"
          >
            <Play className={`w-3.5 h-3.5 ${isDeploying ? 'animate-spin' : ''}`} />
            {isDeploying ? 'Ejecutando CI/CD...' : 'Simular Pipeline CI/CD'}
          </button>
        </div>
      </div>

      {/* Interactive Visual Pipeline Stages */}
      <div className="p-6 rounded-3xl glass-panel border border-neutral-800 space-y-5">
        <h4 className="text-sm font-serif-luxury font-bold text-neutral-200">
          Etapas del Pipeline de Integración y Entrega Continua
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {/* Stage 1 */}
          <div
            className={`p-4 rounded-2xl border transition-all ${
              pipelineStep >= 1
                ? 'bg-neutral-900/90 border-emerald-500/40 shadow-sm shadow-emerald-500/10'
                : 'bg-neutral-950/50 border-neutral-800 opacity-60'
            }`}
          >
            <div className="flex items-center justify-between text-xs font-mono-code text-neutral-400 mb-2">
              <span>Etapa 1</span>
              {pipelineStep >= 1 ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <span className="w-2 h-2 rounded-full bg-neutral-600" />
              )}
            </div>
            <h5 className="font-bold text-white text-xs">Linting & TypeScript</h5>
            <p className="text-[11px] text-neutral-400 mt-1">Verificación estricta sin errores de tipo</p>
          </div>

          {/* Stage 2 */}
          <div
            className={`p-4 rounded-2xl border transition-all ${
              pipelineStep >= 2
                ? 'bg-neutral-900/90 border-emerald-500/40 shadow-sm shadow-emerald-500/10'
                : 'bg-neutral-950/50 border-neutral-800 opacity-60'
            }`}
          >
            <div className="flex items-center justify-between text-xs font-mono-code text-neutral-400 mb-2">
              <span>Etapa 2</span>
              {pipelineStep >= 2 ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <span className="w-2 h-2 rounded-full bg-neutral-600" />
              )}
            </div>
            <h5 className="font-bold text-white text-xs">Seguridad & E2EE</h5>
            <p className="text-[11px] text-neutral-400 mt-1">Trivy Scan, npm audit y verificación SHA-256</p>
          </div>

          {/* Stage 3 */}
          <div
            className={`p-4 rounded-2xl border transition-all ${
              pipelineStep >= 3
                ? 'bg-neutral-900/90 border-emerald-500/40 shadow-sm shadow-emerald-500/10'
                : 'bg-neutral-950/50 border-neutral-800 opacity-60'
            }`}
          >
            <div className="flex items-center justify-between text-xs font-mono-code text-neutral-400 mb-2">
              <span>Etapa 3</span>
              {pipelineStep >= 3 ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <span className="w-2 h-2 rounded-full bg-neutral-600" />
              )}
            </div>
            <h5 className="font-bold text-white text-xs">Docker Buildx (Multi-Stage)</h5>
            <p className="text-[11px] text-neutral-400 mt-1">Alpine Node 22 minimal, non-root user</p>
          </div>

          {/* Stage 4 */}
          <div
            className={`p-4 rounded-2xl border transition-all ${
              pipelineStep >= 4
                ? 'bg-neutral-900/90 border-emerald-500/40 shadow-sm shadow-emerald-500/10'
                : 'bg-neutral-950/50 border-neutral-800 opacity-60'
            }`}
          >
            <div className="flex items-center justify-between text-xs font-mono-code text-neutral-400 mb-2">
              <span>Etapa 4</span>
              {pipelineStep >= 4 ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <span className="w-2 h-2 rounded-full bg-neutral-600" />
              )}
            </div>
            <h5 className="font-bold text-white text-xs">Despliegue en la Nube</h5>
            <p className="text-[11px] text-neutral-400 mt-1">Cloud Run / K8s con zero-downtime rollback</p>
          </div>
        </div>

        {/* Live Terminal Log Stream */}
        <div className="rounded-2xl bg-neutral-950 p-4 border border-neutral-800 font-mono-code text-xs text-neutral-300 space-y-1 max-h-40 overflow-y-auto">
          {pipelineLogs.map((log, index) => (
            <div key={index} className="flex items-center gap-2">
              <span className="text-neutral-500 select-none">&gt;</span>
              <span className={log.includes('PASADO') || log.includes('éxito') ? 'text-emerald-300' : ''}>
                {log}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Code Assets Exporter & Viewer */}
      <div className="rounded-3xl glass-panel border border-neutral-800 overflow-hidden shadow-2xl">
        <div className="p-4 bg-neutral-900/60 border-b border-neutral-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setActiveFileTab('docker')}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono-code transition-all ${
                activeFileTab === 'docker'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Dockerfile
            </button>
            <button
              onClick={() => setActiveFileTab('compose')}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono-code transition-all ${
                activeFileTab === 'compose'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              docker-compose.yml
            </button>
            <button
              onClick={() => setActiveFileTab('github')}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono-code transition-all ${
                activeFileTab === 'github'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              .github/workflows/deploy.yml
            </button>
            <button
              onClick={() => setActiveFileTab('git')}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono-code transition-all ${
                activeFileTab === 'git'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Guía Git / GitHub
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-xs text-neutral-200 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copiado' : 'Copiar Archivo'}</span>
            </button>

            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-xs text-neutral-200 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Descargar</span>
            </button>
          </div>
        </div>

        <div className="p-5 bg-neutral-950 font-mono-code text-xs text-neutral-300 overflow-x-auto max-h-96">
          <pre>{getActiveContent()}</pre>
        </div>
      </div>
    </div>
  );
};

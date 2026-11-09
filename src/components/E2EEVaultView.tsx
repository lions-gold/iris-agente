import React, { useState } from 'react';
import {
  Lock,
  Unlock,
  Key,
  ShieldCheck,
  ShieldAlert,
  Copy,
  Check,
  FileKey,
  Hash,
  Download,
  Upload,
} from 'lucide-react';
import { encryptData, decryptData, EncryptedPayload } from '../services/crypto';
import { irisVoice } from '../services/speech';

export const E2EEVaultView: React.FC = () => {
  const [passphrase, setPassphrase] = useState('CarlosSmith_E2EE_2026_Key!');
  const [showPassphrase, setShowPassphrase] = useState(false);
  
  // Encrypt box
  const [plaintextInput, setPlaintextInput] = useState(
    'MOU Confidencial Bodega StockLlave: Reservar lote 51-22 y 90-05 exclusivamente para el Creador Carlos Smith Zambrano Gonzalez. Contrato y distribución blindada.'
  );
  const [lastEncryptedPayload, setLastEncryptedPayload] = useState<EncryptedPayload | null>(null);
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [encryptError, setEncryptError] = useState<string | null>(null);
  const [copiedCipher, setCopiedCipher] = useState(false);

  // Decrypt box
  const [cipherInput, setCipherInput] = useState('');
  const [decryptedOutput, setDecryptedOutput] = useState<string | null>(null);
  const [decryptError, setDecryptError] = useState<string | null>(null);
  const [isDecrypting, setIsDecrypting] = useState(false);

  // Handle Encrypt
  const handleEncrypt = async () => {
    if (!plaintextInput.trim() || !passphrase.trim()) return;
    setIsEncrypting(true);
    setEncryptError(null);
    try {
      const payload = await encryptData(plaintextInput, passphrase);
      setLastEncryptedPayload(payload);
      setCipherInput(JSON.stringify(payload, null, 2));
      irisVoice.playHarmonicChime('encrypt');
    } catch (err: any) {
      setEncryptError('Error en cifrado: ' + (err.message || String(err)));
    } finally {
      setIsEncrypting(false);
    }
  };

  // Handle Decrypt
  const handleDecrypt = async () => {
    if (!cipherInput.trim() || !passphrase.trim()) return;
    setIsDecrypting(true);
    setDecryptError(null);
    setDecryptedOutput(null);
    try {
      const parsed: EncryptedPayload = JSON.parse(cipherInput);
      const text = await decryptData(parsed, passphrase);
      setDecryptedOutput(text);
      irisVoice.playHarmonicChime('spark');
    } catch (err: any) {
      setDecryptError(err.message || 'Error al descifrar. Llave incorrecta o datos corruptos.');
    } finally {
      setIsDecrypting(false);
    }
  };

  const handleCopyCipher = () => {
    if (!lastEncryptedPayload) return;
    navigator.clipboard.writeText(JSON.stringify(lastEncryptedPayload, null, 2));
    setCopiedCipher(true);
    setTimeout(() => setCopiedCipher(false), 2000);
  };

  const handleDownloadVaultFile = () => {
    if (!lastEncryptedPayload) return;
    const blob = new Blob([JSON.stringify(lastEncryptedPayload, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Iris_E2EE_Vault_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Top E2EE Certification Banner */}
      <div className="rounded-3xl glass-panel p-6 border border-emerald-500/30 shadow-2xl relative overflow-hidden">
        <div className="absolute -right-20 -bottom-20 w-60 h-60 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/20">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif-luxury text-xl font-bold text-white">
                  Bóveda Criptográfica E2EE de Iris
                </h3>
                <span className="text-[10px] font-mono-code px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  AES-256-GCM + PBKDF2
                </span>
              </div>
              <p className="text-xs text-neutral-300 mt-1 max-w-xl">
                Cifrado de datos de extremo a extremo sin conocimiento cero (Zero-Knowledge). Las llaves criptográficas se derivan y ejecutan en la máquina del cliente, garantizando confidencialidad inviolable para el creador <strong className="text-neutral-100">Carlos Smith Zambrano Gonzalez</strong>.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-neutral-900/80 border border-neutral-800 text-xs font-mono-code text-neutral-400">
            <Hash className="w-4 h-4 text-emerald-400" />
            <span>SHA-256 Checksum: Activo</span>
          </div>
        </div>
      </div>

      {/* Master Key Configuration */}
      <div className="p-5 rounded-2xl bg-neutral-950/70 border border-neutral-800 space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-mono-code text-rose-300 flex items-center gap-2">
            <Key className="w-4 h-4 text-rose-400" />
            Llave Maestra / Frase Secreta de Cifrado (PBKDF2 100,000 iteraciones):
          </label>
          <button
            onClick={() => setShowPassphrase(!showPassphrase)}
            className="text-[11px] font-mono-code text-neutral-400 hover:text-white"
          >
            {showPassphrase ? 'Ocultar' : 'Mostrar'}
          </button>
        </div>

        <div className="relative">
          <input
            type={showPassphrase ? 'text' : 'password'}
            value={passphrase}
            onChange={(e) => setPassphrase(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-sm font-mono-code text-emerald-300 focus:outline-none focus:border-emerald-500"
          />
        </div>
        <p className="text-[11px] text-neutral-500">
          Esta contraseña jamás viaja a ningún servidor sin cifrar. Solo quien posea esta llave podrá descifrar los registros.
        </p>
      </div>

      {/* Two Column Crypto Workbench: Encrypt & Decrypt */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ENCRYPT BOX */}
        <div className="rounded-2xl glass-panel p-5 border border-rose-500/20 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-serif-luxury font-bold text-white text-base flex items-center gap-2">
              <Lock className="w-4 h-4 text-rose-400" />
              Cifrar Registro Confidencial
            </h4>
            <span className="text-[10px] font-mono-code text-neutral-400">Texto plano ➔ Cifrado</span>
          </div>

          <div>
            <textarea
              rows={4}
              value={plaintextInput}
              onChange={(e) => setPlaintextInput(e.target.value)}
              placeholder="Escribe la información de bodega, notas secretas o registros VIP..."
              className="w-full p-3.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-rose-500"
            />
          </div>

          <button
            onClick={handleEncrypt}
            disabled={isEncrypting || !plaintextInput.trim()}
            className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-medium text-xs flex items-center justify-center gap-2 shadow-lg shadow-rose-600/25 transition-all disabled:opacity-50"
          >
            <Lock className="w-3.5 h-3.5" />
            {isEncrypting ? 'Derivando llave y cifrando...' : 'Cifrar con AES-256-GCM'}
          </button>

          {encryptError && (
            <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-red-400 flex-shrink-0" />
              <span>{encryptError}</span>
            </div>
          )}

          {lastEncryptedPayload && (
            <div className="space-y-3 pt-2 border-t border-neutral-800">
              <div className="flex items-center justify-between text-xs font-mono-code text-neutral-400">
                <span>Resultado Cifrado (Base64):</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyCipher}
                    className="flex items-center gap-1 text-[11px] text-rose-300 hover:text-white"
                  >
                    {copiedCipher ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    {copiedCipher ? 'Copiado' : 'Copiar'}
                  </button>
                  <button
                    onClick={handleDownloadVaultFile}
                    className="flex items-center gap-1 text-[11px] text-neutral-300 hover:text-white"
                  >
                    <Download className="w-3 h-3" /> Descargar .json
                  </button>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 font-mono-code text-[11px] text-neutral-300 overflow-x-auto max-h-36">
                <pre>{JSON.stringify(lastEncryptedPayload, null, 2)}</pre>
              </div>

              <div className="text-[10px] font-mono-code text-emerald-400 flex items-center gap-1">
                <Check className="w-3 h-3" />
                Integridad SHA-256 garantizada: {lastEncryptedPayload.checksumSha256.slice(0, 16)}...
              </div>
            </div>
          )}
        </div>

        {/* DECRYPT BOX */}
        <div className="rounded-2xl glass-panel p-5 border border-purple-500/20 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-serif-luxury font-bold text-white text-base flex items-center gap-2">
              <Unlock className="w-4 h-4 text-purple-400" />
              Descifrar Bóveda Confidencial
            </h4>
            <span className="text-[10px] font-mono-code text-neutral-400">Cifrado ➔ Texto plano</span>
          </div>

          <div>
            <textarea
              rows={4}
              value={cipherInput}
              onChange={(e) => setCipherInput(e.target.value)}
              placeholder="Pega aquí el payload JSON cifrado { cipherBase64, ivBase64, saltBase64... }"
              className="w-full p-3.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs font-mono-code text-white placeholder-neutral-500 focus:outline-none focus:border-purple-500"
            />
          </div>

          <button
            onClick={handleDecrypt}
            disabled={isDecrypting || !cipherInput.trim()}
            className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-600/25 transition-all disabled:opacity-50"
          >
            <Unlock className="w-3.5 h-3.5" />
            {isDecrypting ? 'Descifrando y verificando integridad...' : 'Descifrar Datos'}
          </button>

          {decryptError && (
            <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-red-400 flex-shrink-0" />
              <span>{decryptError}</span>
            </div>
          )}

          {decryptedOutput && (
            <div className="space-y-2 pt-2 border-t border-neutral-800">
              <div className="flex items-center justify-between text-xs font-mono-code text-emerald-400">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4" /> Texto Descifrado con Éxito:
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-xs text-emerald-100 font-light leading-relaxed whitespace-pre-wrap">
                {decryptedOutput}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * End-to-End Encryption (E2EE) Engine for Iris AI & StockLlave
 * Implements native Web Crypto API: PBKDF2 key derivation + AES-256-GCM authenticated cipher.
 * Zero-Knowledge architecture: Data is encrypted and decrypted exclusively in the client.
 */

export interface EncryptedPayload {
  cipherBase64: string;
  ivBase64: string;
  saltBase64: string;
  checksumSha256: string;
  timestamp: string;
}

// Convert ArrayBuffer to Base64
function bufferToBase64(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Convert Base64 to Uint8Array
function base64ToBuffer(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

// Derive AES-256-GCM CryptoKey from creator passphrase using PBKDF2
async function deriveKey(passphrase: string, salt: Uint8Array): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    enc.encode(passphrase),
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  );

  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt as any,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

// Calculate SHA-256 digest
export async function calculateSha256(data: string): Promise<string> {
  const enc = new TextEncoder();
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', enc.encode(data));
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

// Encrypt plaintext with AES-256-GCM
export async function encryptData(plaintext: string, secretKey: string): Promise<EncryptedPayload> {
  const enc = new TextEncoder();
  const salt = window.crypto.getRandomValues(new Uint8Array(16));
  const iv = window.crypto.getRandomValues(new Uint8Array(12));

  const key = await deriveKey(secretKey, salt);
  const cipherBuffer = await window.crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv,
    },
    key,
    enc.encode(plaintext)
  );

  const checksumSha256 = await calculateSha256(plaintext);

  return {
    cipherBase64: bufferToBase64(cipherBuffer),
    ivBase64: bufferToBase64(iv),
    saltBase64: bufferToBase64(salt),
    checksumSha256,
    timestamp: new Date().toISOString(),
  };
}

// Decrypt ciphertext with AES-256-GCM
export async function decryptData(payload: EncryptedPayload, secretKey: string): Promise<string> {
  const salt = base64ToBuffer(payload.saltBase64);
  const iv = base64ToBuffer(payload.ivBase64);
  const cipherBuffer = base64ToBuffer(payload.cipherBase64);

  const key = await deriveKey(secretKey, salt);
  const dec = new TextDecoder();

  const decryptedBuffer = await window.crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: iv as any,
    },
    key,
    cipherBuffer as any
  );

  const decryptedText = dec.decode(decryptedBuffer);

  // Validate integrity checksum
  const verifiedChecksum = await calculateSha256(decryptedText);
  if (verifiedChecksum !== payload.checksumSha256) {
    throw new Error('Alerta de seguridad: Hash de integridad no coincide. Datos posiblemente manipulados.');
  }

  return decryptedText;
}

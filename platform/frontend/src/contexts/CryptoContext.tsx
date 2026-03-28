/**
 * CryptoContext
 *
 * End-to-end encryption using the Web Crypto API:
 *   - Each user has an RSA-OAEP 2048-bit key pair.
 *   - Key pair is generated on first login and stored in localStorage
 *     (private key is exported as JWK and stored under 'private_key_jwk').
 *   - Public key (SPKI, base64) is uploaded to the server so others can
 *     use it to encrypt messages for this user.
 *
 * Encryption flow (sender → recipient):
 *   1. Generate a random 256-bit AES-GCM key.
 *   2. Generate a random 12-byte IV.
 *   3. Encrypt the plaintext with AES-GCM (key + IV) → ciphertext.
 *   4. Encrypt the AES key bytes with the recipient's RSA-OAEP public key → encrypted_key.
 *   5. Send: { ciphertext (b64), encrypted_key (b64), iv (b64) }.
 *
 * Decryption flow (recipient):
 *   1. Decrypt the AES key using own RSA private key.
 *   2. Decrypt the ciphertext using the recovered AES key + IV.
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { updateMe } from '../api';

interface CryptoContextValue {
  publicKeyB64: string | null;
  encryptForRecipient: (
    plaintext: string,
    recipientPublicKeyB64: string
  ) => Promise<{ ciphertext: string; encrypted_key: string; iv: string }>;
  decryptMessage: (
    ciphertext: string,
    encryptedKey: string,
    iv: string
  ) => Promise<string>;
  ready: boolean;
}

const CryptoContext = createContext<CryptoContextValue | null>(null);

function b64ToBuffer(b64: string): ArrayBuffer {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes.buffer;
}

function bufferToB64(buf: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(buf)));
}

async function generateKeyPair(): Promise<CryptoKeyPair> {
  return crypto.subtle.generateKey(
    { name: 'RSA-OAEP', modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256' },
    true,
    ['encrypt', 'decrypt']
  );
}

async function exportPublicKey(key: CryptoKey): Promise<string> {
  const spki = await crypto.subtle.exportKey('spki', key);
  return bufferToB64(spki);
}

async function importPublicKey(b64: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'spki',
    b64ToBuffer(b64),
    { name: 'RSA-OAEP', hash: 'SHA-256' },
    false,
    ['encrypt']
  );
}

async function exportPrivateKey(key: CryptoKey): Promise<object> {
  return crypto.subtle.exportKey('jwk', key);
}

async function importPrivateKey(jwk: object): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'jwk',
    jwk,
    { name: 'RSA-OAEP', hash: 'SHA-256' },
    false,
    ['decrypt']
  );
}

export function CryptoProvider({ children }: { children: React.ReactNode }) {
  const [privateKey, setPrivateKey] = useState<CryptoKey | null>(null);
  const [publicKeyB64, setPublicKeyB64] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  // Load or generate key pair on mount (only when logged in)
  useEffect(() => {
    async function loadOrGenerate() {
      const token = localStorage.getItem('access_token');
      if (!token) return;

      const storedJwk = localStorage.getItem('private_key_jwk');
      const storedPub = localStorage.getItem('public_key_b64');

      if (storedJwk && storedPub) {
        try {
          const privKey = await importPrivateKey(JSON.parse(storedJwk));
          setPrivateKey(privKey);
          setPublicKeyB64(storedPub);
          setReady(true);
          return;
        } catch {
          // corrupted – regenerate
        }
      }

      // Generate fresh pair
      const pair = await generateKeyPair();
      const pubB64 = await exportPublicKey(pair.publicKey);
      const privJwk = await exportPrivateKey(pair.privateKey);

      localStorage.setItem('private_key_jwk', JSON.stringify(privJwk));
      localStorage.setItem('public_key_b64', pubB64);

      setPrivateKey(pair.privateKey);
      setPublicKeyB64(pubB64);

      // Upload public key to server
      try {
        await updateMe({ public_key: pubB64 });
      } catch {
        // Non-critical; will retry on next load
      }

      setReady(true);
    }

    loadOrGenerate();
  }, []);

  const encryptForRecipient = useCallback(
    async (plaintext: string, recipientPublicKeyB64: string) => {
      const recipientKey = await importPublicKey(recipientPublicKeyB64);

      // Generate one-time AES-GCM key
      const aesKey = await crypto.subtle.generateKey(
        { name: 'AES-GCM', length: 256 },
        true,
        ['encrypt', 'decrypt']
      );
      const iv = crypto.getRandomValues(new Uint8Array(12));

      // Encrypt plaintext
      const encoder = new TextEncoder();
      const encryptedBuf = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        aesKey,
        encoder.encode(plaintext)
      );

      // Wrap AES key with recipient's RSA public key
      const rawAesKey = await crypto.subtle.exportKey('raw', aesKey);
      const encryptedKeyBuf = await crypto.subtle.encrypt(
        { name: 'RSA-OAEP' },
        recipientKey,
        rawAesKey
      );

      return {
        ciphertext: bufferToB64(encryptedBuf),
        encrypted_key: bufferToB64(encryptedKeyBuf),
        iv: bufferToB64(iv.buffer),
      };
    },
    []
  );

  const decryptMessage = useCallback(
    async (ciphertext: string, encryptedKey: string, iv: string) => {
      if (!privateKey) throw new Error('Private key not available');

      // Unwrap AES key
      const rawAesKey = await crypto.subtle.decrypt(
        { name: 'RSA-OAEP' },
        privateKey,
        b64ToBuffer(encryptedKey)
      );
      const aesKey = await crypto.subtle.importKey(
        'raw',
        rawAesKey,
        { name: 'AES-GCM', length: 256 },
        false,
        ['decrypt']
      );

      // Decrypt message
      const plainBuf = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: b64ToBuffer(iv) },
        aesKey,
        b64ToBuffer(ciphertext)
      );
      return new TextDecoder().decode(plainBuf);
    },
    [privateKey]
  );

  return (
    <CryptoContext.Provider
      value={{ publicKeyB64, encryptForRecipient, decryptMessage, ready }}
    >
      {children}
    </CryptoContext.Provider>
  );
}

export function useCrypto(): CryptoContextValue {
  const ctx = useContext(CryptoContext);
  if (!ctx) throw new Error('useCrypto must be used inside CryptoProvider');
  return ctx;
}

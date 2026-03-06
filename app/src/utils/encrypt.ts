// ─────────────────────────────────────────────────────────────
// Encryption Utility — AES-GCM via Web Crypto API
// Personal data is encrypted in the browser before IPFS upload.
// The raw data NEVER leaves the device unencrypted.
// ─────────────────────────────────────────────────────────────

// Generate a new random AES-256-GCM encryption key
export async function generateKey(): Promise<CryptoKey> {
  return crypto.subtle.generateKey(
    { name: "AES-GCM", length: 256 },
    true,        // extractable — so we can export it for the user to save
    ["encrypt", "decrypt"]
  );
}

// Export a CryptoKey to a hex string (for user to save)
export async function exportKeyHex(key: CryptoKey): Promise<string> {
  const raw = await crypto.subtle.exportKey("raw", key);
  return Array.from(new Uint8Array(raw))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}

// Import a hex string back to a CryptoKey
export async function importKeyHex(hex: string): Promise<CryptoKey> {
  const raw = new Uint8Array(hex.match(/.{2}/g)!.map(b => parseInt(b, 16)));
  return crypto.subtle.importKey(
    "raw", raw,
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );
}

// Encrypt any object to a base64 string
export async function encryptData(
  data: object,
  key: CryptoKey
): Promise<{ encryptedBase64: string; ivHex: string }> {
  const iv          = crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV
  const encoded     = new TextEncoder().encode(JSON.stringify(data));
  const encrypted   = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, encoded);

  const encryptedBase64 = btoa(String.fromCharCode(...new Uint8Array(encrypted)));
  const ivHex           = Array.from(iv).map(b => b.toString(16).padStart(2, "0")).join("");

  return { encryptedBase64, ivHex };
}

// Decrypt a base64 string back to an object
export async function decryptData(
  encryptedBase64: string,
  ivHex: string,
  key: CryptoKey
): Promise<object> {
  const iv        = new Uint8Array(ivHex.match(/.{2}/g)!.map(b => parseInt(b, 16)));
  const encrypted = Uint8Array.from(atob(encryptedBase64), c => c.charCodeAt(0));
  const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, encrypted);

  return JSON.parse(new TextDecoder().decode(decrypted));
}

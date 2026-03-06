// ─────────────────────────────────────────────────────────────
// IPFS Upload Utility — Pinata
// Uploads encrypted data to IPFS via Pinata's API.
// Only encrypted blobs are uploaded — never raw personal data.
// ─────────────────────────────────────────────────────────────

const PINATA_JWT = import.meta.env.VITE_PINATA_JWT as string;
const PINATA_URL = "https://api.pinata.cloud/pinning/pinJSONToIPFS";

export interface IPFSPayload {
  encryptedData: string; // base64 encrypted blob
  iv: string;            // hex IV used for encryption
  timestamp: number;     // upload timestamp
  dataType: string;      // "donor_registration" | "brain_death_cert"
}

// Upload encrypted data to IPFS via Pinata
// Returns the IPFS CID (content identifier)
export async function uploadToIPFS(
  payload: IPFSPayload,
  pinName: string
): Promise<string> {
  if (!PINATA_JWT) {
    throw new Error("Pinata JWT not set. Add VITE_PINATA_JWT to your .env file.");
  }

  const response = await fetch(PINATA_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${PINATA_JWT}`,
    },
    body: JSON.stringify({
      pinataContent: payload,
      pinataMetadata: { name: pinName },
      pinataOptions:  { cidVersion: 1 },
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Pinata upload failed: ${err}`);
  }

  const result = await response.json();
  return result.IpfsHash; // This is the CID
}

// Build the IPFS gateway URL to view the uploaded file
export function ipfsGatewayUrl(cid: string): string {
  return `https://gateway.pinata.cloud/ipfs/${cid}`;
}

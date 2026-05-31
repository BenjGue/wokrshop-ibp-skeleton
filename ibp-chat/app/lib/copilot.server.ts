// Minimal GitHub Copilot SDK wrapper for the workshop skeleton.
// Singleton client + one-shot `askOnce`. No streaming, no session reuse.
// You will extend this during the workshop (model picker, streaming, system prompts, etc.).
import { CopilotClient, approveAll } from "@github/copilot-sdk";

let clientPromise: Promise<CopilotClient> | null = null;

function getClient(): Promise<CopilotClient> {
  if (!clientPromise) {
    clientPromise = (async () => {
      const client = new CopilotClient();
      await client.start();
      return client;
    })().catch((err) => {
      clientPromise = null;
      throw err;
    });
  }
  return clientPromise;
}

export async function askOnce(model: string, prompt: string): Promise<string> {
  const client = await getClient();
  const session = await client.createSession({
    model,
    streaming: false,
    onPermissionRequest: approveAll,
  });
  try {
    const result = await session.sendAndWait({ prompt }, 180_000);
    return result?.data?.content ?? "";
  } finally {
    try { await session.disconnect(); } catch { /* best effort */ }
  }
}

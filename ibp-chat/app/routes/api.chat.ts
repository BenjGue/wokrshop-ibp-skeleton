import { askOnce } from "~/lib/copilot.server";
import { SYSTEM_PROMPT, buildDataContext } from "~/lib/prompts.server";

const DEFAULT_MODEL = "claude-sonnet-4.6";

export async function action({ request }: { request: Request }) {
  if (request.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }
  const { prompt, model } = (await request.json()) as { prompt?: string; model?: string };
  if (!prompt || !prompt.trim()) {
    return Response.json({ error: "Missing prompt" }, { status: 400 });
  }
  try {
    const systemMessage = SYSTEM_PROMPT + "\n\nCONTEXT:\n" + buildDataContext();
    const reply = await askOnce(model?.trim() || DEFAULT_MODEL, prompt, systemMessage);
    return Response.json({ reply });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return Response.json({ error: message }, { status: 500 });
  }
}

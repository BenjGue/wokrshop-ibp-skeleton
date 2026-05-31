import { askOnce } from "~/lib/copilot.server";

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
    const reply = await askOnce(model?.trim() || DEFAULT_MODEL, prompt);
    return Response.json({ reply });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return Response.json({ error: message }, { status: 500 });
  }
}

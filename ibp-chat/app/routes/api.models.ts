import { listModels } from "~/lib/copilot.server";

export async function loader() {
  try {
    const models = await listModels();
    return Response.json({ models });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return Response.json({ error: message, models: [] }, { status: 500 });
  }
}

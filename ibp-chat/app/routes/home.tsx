import { useState } from "react";

export function meta() {
  return [{ title: "IBP Chat — Workshop skeleton" }];
}

export default function Home() {
  const [input, setInput] = useState("");
  const [reply, setReply] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function send() {
    if (!input.trim() || busy) return;
    setBusy(true);
    setError("");
    setReply("");
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: input }),
      });
      const data = (await res.json()) as { reply?: string; error?: string };
      if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
      setReply(data.reply ?? "");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Request failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      <div className="mx-auto max-w-2xl px-4 py-8 flex flex-col gap-4">
        <header>
          <h1 className="text-xl font-semibold">IBP Chat — Workshop skeleton</h1>
          <p className="text-sm text-gray-500">
            Hard-coded model · Follow the workshop instructions to extend it.
          </p>
        </header>

        <form
          className="flex flex-col gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            send();
          }}
        >
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask something…"
            rows={3}
            className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
          />
          <button
            type="submit"
            disabled={busy || !input.trim()}
            className="self-end rounded-md bg-blue-600 px-4 py-2 text-sm text-white disabled:opacity-50"
          >
            {busy ? "…" : "Send"}
          </button>
        </form>

        {error && <div className="text-sm text-red-600">{error}</div>}

        {reply && (
          <pre className="whitespace-pre-wrap rounded-md border border-gray-200 bg-white p-4 text-sm">
            {reply}
          </pre>
        )}
      </div>
    </main>
  );
}

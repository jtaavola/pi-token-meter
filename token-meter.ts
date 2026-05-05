import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";

export default function (pi: ExtensionAPI) {
  let startTime: number | null = null;

  pi.on("session_start", async () => {
    startTime = null;
  });

  pi.on("message_start", async (event) => {
    if (event.message.role === "assistant") {
      startTime = performance.now();
    }
  });

  pi.on("message_end", async (event, ctx) => {
    if (event.message.role !== "assistant" || startTime === null) return;

    const outputTokens = event.message.usage?.output ?? 0;
    const elapsedSec = (performance.now() - startTime) / 1000;

    if (outputTokens > 0 && elapsedSec > 0) {
      const tps = outputTokens / elapsedSec;
      const display = tps < 10 ? tps.toFixed(1) : Math.round(tps).toString();
      ctx.ui.setStatus("token-meter", ctx.ui.theme.fg("dim", `${display} tok/s`));
    }

    startTime = null;
  });

  pi.on("agent_end", async () => {
    startTime = null;
  });
}

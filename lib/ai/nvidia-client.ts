export type AiMessageRole = "system" | "user" | "assistant"

export type AiChatMessage = {
  role: AiMessageRole
  content: string
}

export type AiStreamOptions = {
  temperature?: number
}

export interface AiClient {
  stream(
    messages: AiChatMessage[],
    opts?: AiStreamOptions
  ): AsyncGenerator<string>
}

const NVIDIA_INVOKE_URL =
  "https://integrate.api.nvidia.com/v1/chat/completions"
const NVIDIA_MODEL = "moonshotai/kimi-k2.6"
const DEFAULT_TEMPERATURE = 0.4

export function createNvidiaClient(): AiClient {
  const apiKey = process.env.NVIDIA_API_KEY
  if (!apiKey) {
    throw new Error("NVIDIA_API_KEY manquante dans l'environnement")
  }

  return {
    async *stream(messages, opts) {
      const response = await fetch(NVIDIA_INVOKE_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          Accept: "text/event-stream",
        },
        body: JSON.stringify({
          model: NVIDIA_MODEL,
          messages,
          temperature: opts?.temperature ?? DEFAULT_TEMPERATURE,
          stream: true,
        }),
      })

      if (!response.ok || !response.body) {
        throw new Error(
          `Erreur API NVIDIA (${response.status} ${response.statusText})`
        )
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })

        let newlineIndex = buffer.indexOf("\n")
        while (newlineIndex !== -1) {
          const line = buffer.slice(0, newlineIndex).trim()
          buffer = buffer.slice(newlineIndex + 1)
          newlineIndex = buffer.indexOf("\n")

          if (!line.startsWith("data: ")) continue
          const payload = line.slice(6)
          if (payload === "[DONE]") continue
          try {
            const delta = JSON.parse(payload).choices?.[0]?.delta?.content
            if (typeof delta === "string" && delta.length > 0) {
              yield delta
            }
          } catch {
            // ignore lignes partielles ou non-JSON
          }
        }
      }
    },
  }
}

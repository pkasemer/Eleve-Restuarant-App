/**
 * Minimal MCP client over the Streamable HTTP transport (spec 2025-06-18).
 * Just enough to: initialize -> notifications/initialized -> tools/call -> close.
 * Works with servers that answer either with application/json or a text/event-stream.
 */

const PROTOCOL_VERSION = '2025-06-18';
const REQUEST_TIMEOUT_MS = 30_000;

type JsonRpcResponse = {
  jsonrpc: '2.0';
  id?: number | string | null;
  result?: unknown;
  error?: { code: number; message: string; data?: unknown };
};

export type McpToolResult = {
  content?: { type: string; text?: string }[];
  structuredContent?: unknown;
  isError?: boolean;
};

export class McpError extends Error {}

export class McpClient {
  private sessionId: string | null = null;
  private nextId = 1;

  constructor(
    private readonly url: string,
    private readonly token?: string,
    private readonly clientInfo = { name: 'eleve-app', version: '1.0.0' },
  ) {}

  private headers(): Record<string, string> {
    const h: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json, text/event-stream',
      'MCP-Protocol-Version': PROTOCOL_VERSION,
    };
    if (this.token) h.Authorization = `Bearer ${this.token}`;
    if (this.sessionId) h['Mcp-Session-Id'] = this.sessionId;
    return h;
  }

  private async post(body: object): Promise<Response> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    try {
      return await fetch(this.url, {
        method: 'POST',
        headers: this.headers(),
        body: JSON.stringify(body),
        signal: controller.signal,
      });
    } catch (e) {
      if ((e as Error).name === 'AbortError') throw new McpError('Request timed out');
      throw new McpError(`Network error: ${(e as Error).message}`);
    } finally {
      clearTimeout(timer);
    }
  }

  private async request<T>(method: string, params?: object): Promise<T> {
    const id = this.nextId++;
    const res = await this.post({ jsonrpc: '2.0', id, method, params });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new McpError(`Server returned ${res.status}${text ? `: ${text.slice(0, 200)}` : ''}`);
    }

    const sid = res.headers.get('mcp-session-id');
    if (sid) this.sessionId = sid;

    const raw = await res.text();
    const contentType = res.headers.get('content-type') ?? '';
    const messages = contentType.includes('text/event-stream')
      ? parseSse(raw)
      : [JSON.parse(raw) as JsonRpcResponse];

    const reply = messages.find((m) => m.id === id);
    if (!reply) throw new McpError('No response received for request');
    if (reply.error) throw new McpError(reply.error.message);
    return reply.result as T;
  }

  async connect() {
    await this.request('initialize', {
      protocolVersion: PROTOCOL_VERSION,
      capabilities: {},
      clientInfo: this.clientInfo,
    });
    // Notification: no id, server replies 202 with no body.
    const res = await this.post({ jsonrpc: '2.0', method: 'notifications/initialized' });
    if (!res.ok && res.status !== 202) {
      throw new McpError(`Initialization failed (${res.status})`);
    }
  }

  async callTool(name: string, args: Record<string, unknown>): Promise<McpToolResult> {
    const result = await this.request<McpToolResult>('tools/call', { name, arguments: args });
    if (result.isError) {
      const text = result.content?.find((c) => c.type === 'text')?.text;
      throw new McpError(text ?? `Tool "${name}" reported an error`);
    }
    return result;
  }

  /** Best-effort: tell the server we're done with the session. */
  async close() {
    if (!this.sessionId) return;
    try {
      await fetch(this.url, { method: 'DELETE', headers: this.headers() });
    } catch {
      // ignore
    }
    this.sessionId = null;
  }
}

function parseSse(raw: string): JsonRpcResponse[] {
  const out: JsonRpcResponse[] = [];
  for (const event of raw.split(/\r?\n\r?\n/)) {
    const data = event
      .split(/\r?\n/)
      .filter((l) => l.startsWith('data:'))
      .map((l) => l.slice(5).trimStart())
      .join('\n');
    if (!data) continue;
    try {
      out.push(JSON.parse(data) as JsonRpcResponse);
    } catch {
      // skip non-JSON events (e.g. keep-alives)
    }
  }
  return out;
}

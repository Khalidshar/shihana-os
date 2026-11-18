import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

export interface JEVRequest {
  modelTier: 'tier1' | 'tier2' | 'tier3';
  prompt: string;
  localOnly?: boolean;
}

export interface JEVResponse {
  engine: string;
  output: string;
  latencyMs: number;
  privacyProtected: boolean;
}

export class JEVRouter {
  private logPath: string;

  constructor(vaultPath: string) {
    this.logPath = join(vaultPath, '.os', 'logs', 'requests.jsonl');
    const dir = join(vaultPath, '.os', 'logs');
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
  }

  public async route(req: JEVRequest): Promise<JEVResponse> {
    const start = Date.now();
    let selectedEngine = 'claude';

    if (req.localOnly) {
      selectedEngine = 'hermes-local';
    } else if (req.modelTier === 'tier3') {
      selectedEngine = 'gemini';
    } else if (req.modelTier === 'tier2') {
      selectedEngine = 'codex';
    }

    const output = `[JEV Router] Handled by ${selectedEngine} for prompt: "${req.prompt.substring(0, 30)}..."`;
    const latencyMs = Date.now() - start;

    const record = {
      timestamp: new Date().toISOString(),
      tier: req.modelTier,
      engine: selectedEngine,
      localOnly: !!req.localOnly,
      latencyMs
    };

    try {
      writeFileSync(this.logPath, JSON.stringify(record) + '\n', { flag: 'a' });
    } catch (e) {}

    return {
      engine: selectedEngine,
      output,
      latencyMs,
      privacyProtected: !!req.localOnly
    };
  }
}

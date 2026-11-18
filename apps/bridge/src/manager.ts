import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

export interface SystemState {
  activeEngine: string;
  dialect: string;
  dockerContainersRunning: number;
  privacyMode: boolean;
}

export class ShihanaEngineManager {
  private statePath: string;

  constructor(vaultPath: string) {
    this.statePath = join(vaultPath, '.os', 'state.json');
    const dir = join(vaultPath, '.os');
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
  }

  public getSystemState(): SystemState {
    if (existsSync(this.statePath)) {
      try {
        return JSON.parse(readFileSync(this.statePath, 'utf-8'));
      } catch (e) {}
    }
    return {
      activeEngine: 'claude-local-bridge',
      dialect: 'saudi',
      dockerContainersRunning: 4,
      privacyMode: true
    };
  }
}

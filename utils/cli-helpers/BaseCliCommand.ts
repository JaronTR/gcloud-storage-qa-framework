import { execSync } from "child_process";

export class BaseCliCommand {
  executeCLICommand(command: string): { success: boolean; output?: string; error?: string } {
    try {
      const output = execSync(command, { stdio: 'pipe' });
      return { success: true, output: output.toString() };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
}


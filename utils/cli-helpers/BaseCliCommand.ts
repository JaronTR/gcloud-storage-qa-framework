import { execSync } from "child_process";

export class BaseCliCommand {
  executeCLICommand(command: string): { success: boolean; output?: string; error?: string } {
    console.log(`🔄 Executing CLI command: ${command}`);
    
    try {
      const output = execSync(command, { stdio: 'pipe' });
      const outputStr = output.toString();
      const preview = outputStr.length > 100 ? outputStr.substring(0, 100) + '...' : outputStr;
      console.log(`✅ Command executed successfully`);
      console.log(`   Output preview: ${preview.replace(/\n/g, ' ')}`);
      return { success: true, output: outputStr };
    } catch (error: any) {
      console.log(`❌ Command execution failed: ${error.message}`);
      return { success: false, error: error.message };
    }
  }
}


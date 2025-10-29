import { BaseCliCommand } from './BaseCliCommand';
import { GcloudCliClient } from './GcloudCliClient';
import { GcloudCommandType } from '../commands/CommandType';

export class GcloudCliCommands extends BaseCliCommand {
  constructor() {
    super();
  }

  commandBuilder(commandArguments: GcloudCliClient): string {
    console.log(`📋 Building ${commandArguments.cmdName} command`);
    
    const parts: string[] = [];
    
    if (commandArguments.cmdPrefix) {
      parts.push(commandArguments.cmdPrefix);
    }
    
    if (commandArguments.cmdName) {
      parts.push(commandArguments.cmdName);
    }
    
    if (commandArguments.sourcePath) {
      parts.push(commandArguments.sourcePath);
    }
    
    if (commandArguments.destinationPath) {
      parts.push(commandArguments.destinationPath);
    }
    
    if (Array.isArray(commandArguments.cmdFlags)) {
      const flags = commandArguments.cmdFlags.filter(flag => {
        if ((process.env.DOCKER || process.env.CI) && flag.startsWith('--impersonate-service-account')) {
          return false;
        }
        return true;
      }).map(flag => {
        if (flag === '--region=US' && process.env.GCLOUD_BUCKET_REGION) {
          return `--region=${process.env.GCLOUD_BUCKET_REGION}`;
        }
        return flag;
      });
      parts.push(...flags);
    }
    
    const command = parts.join(' ');
    console.log(`✅ Command built: ${command}`);
    return command;
  }

  executeGcloudCliCommand(commandArguments: GcloudCliClient): { success: boolean; output?: string; error?: string } {
    const command = this.commandBuilder(commandArguments);
    const result = this.executeCLICommand(command);
    
    if (result.success) {
      console.log(`✅ GCloud ${commandArguments.cmdName} command completed successfully`);
    } else {
      console.log(`❌ GCloud ${commandArguments.cmdName} command failed`);
    }
    
    return result;
  }
}
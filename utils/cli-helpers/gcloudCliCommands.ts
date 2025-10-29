import { BaseCliCommand } from './BaseCliCommand';
import { GcloudCliClient } from './GcloudCliClient';
import { GcloudCommandType } from '../commands/CommandType';

export class GcloudCliCommands extends BaseCliCommand {
  constructor() {
    super();
  }

  commandBuilder(commandArguments: GcloudCliClient): string {
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
      // Filter out impersonate flag when authenticated as service account
      const flags = commandArguments.cmdFlags.filter(flag => {
        // When in Docker/CI, we're authenticated as the service account
        // So remove the impersonate flag
        if ((process.env.DOCKER || process.env.CI) && flag.startsWith('--impersonate-service-account')) {
          console.log('   ℹ️  Skipping impersonate flag (already authenticated as service account)');
          return false;
        }
        return true;
      }).map(flag => {
        // Replace hardcoded region with environment variable
        if (flag === '--region=US' && process.env.GCLOUD_BUCKET_REGION) {
          return `--region=${process.env.GCLOUD_BUCKET_REGION}`;
        }
        return flag;
      });
      parts.push(...flags);
    }
    
    return parts.join(' ');
  }

  executeGcloudCliCommand(commandArguments: GcloudCliClient): { success: boolean; output?: string; error?: string } {
    const command = this.commandBuilder(commandArguments);
    return this.executeCLICommand(command);
  }
}
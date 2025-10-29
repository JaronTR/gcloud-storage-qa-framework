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
      parts.push(...commandArguments.cmdFlags);
    }
    
    return parts.join(' ');
  }

  executeGcloudCliCommand(commandArguments: GcloudCliClient): { success: boolean; output?: string; error?: string } {
    const command = this.commandBuilder(commandArguments);
    return this.executeCLICommand(command);
  }
}
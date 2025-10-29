import { GcloudCommandType } from './CommandType';
import { GcloudCliCommands } from '../cli-helpers/gcloudCliCommands';

export class CommandFactory {
  static createCommand(type: GcloudCommandType): GcloudCliCommands {
    // Factory logic - currently returns GcloudCliCommands
    // Extensible for future command-specific classes
    const command = new GcloudCliCommands();
    return command;
  }
}


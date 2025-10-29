import { GcloudCommandType } from './CommandType';
import { GcloudCliCommands } from '../cli-helpers/gcloudCliCommands';

export class CommandFactory {
  static createCommand(type: GcloudCommandType): GcloudCliCommands {
    const command = new GcloudCliCommands();
    return command;
  }
}


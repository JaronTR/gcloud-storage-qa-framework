import { GcloudCommandType } from '../commands/CommandType';

export type GcloudCliClient = {
    cmdPrefix: 'gcloud storage';
    cmdName: GcloudCommandType;
    sourcePath?: string;
    destinationPath?: string;
    cmdFlags?: string[];
}
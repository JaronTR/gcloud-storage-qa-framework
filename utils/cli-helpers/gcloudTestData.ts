import { GcloudCliClient } from "../GcloudCliClient";

export interface GcloudTestData {
    testId: string;
    description: string;
    commandArguments: GcloudCliClient;
    expectedSuccess?: boolean;
    expectedOutput?: string;
}
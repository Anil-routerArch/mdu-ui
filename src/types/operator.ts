import type { ID } from "./common";

export interface OperatorNote {
  created: number;
  createdBy: string;
  note: string;
}

export interface OperatorDeviceRules {
  firmwareUpgrade: string;
  rcOnly: string;
  rrm: string;
}

export interface Operator {
  id: ID;
  name: string;
  description?: string;
  registrationId: string;
  defaultOperator: boolean;
  deviceRules: OperatorDeviceRules;
  sourceIP?: string[];
  firmwareRCOnly?: boolean;
  notes: OperatorNote[];
  created: number;
  modified: number;
}

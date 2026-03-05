export type ConditionField = "subject" | "from" | "to" | "keywords";
export type ConditionOperator =
  | "contains"
  | "is"
  | "starts_with"
  | "ends_with"
  | "not_contains";
export type ActionType =
  | "archive"
  | "label"
  | "forward"
  | "mark_important"
  | "skip_inbox"
  | "mark_read"
  | "delete";
export type Logic = "AND" | "OR";

export interface Condition {
  id: string;
  field: ConditionField;
  operator: ConditionOperator;
  value: string;
  logic: Logic;
}

export interface RuleAction {
  id: string;
  type: ActionType;
  value: string;
}

export interface Rule {
  id: string;
  name: string;
  priority: number;
  active: boolean;
  conditions: Condition[];
  actions: RuleAction[];
  emailCount: number;
  stopProcessing: boolean;
}

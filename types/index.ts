export enum OpenAIModel {
  DAVINCI_TURBO = "gpt-3.5-turbo"
}

export interface Message {
  role: Role;
  content: string;
}

export enum SyncState {
  NotStarted,
  Started,
  Successful,
  Failed
}

export type Role = "assistant" | "user";

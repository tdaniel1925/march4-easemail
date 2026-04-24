export { detectProviderType, getProvider, verifyAccountOwnership, getAllAccounts } from "./registry";
export { encryptCredential, decryptCredential } from "./crypto";
export type {
  ProviderType,
  UnifiedAccount,
  EmailProvider,
  NormalizedEmail,
  NormalizedFolder,
  SendEmailParams,
  FetchEmailsOptions,
} from "./types";

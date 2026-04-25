export interface AttachmentItem {
  id: string;
  name: string;
  size: number;
  contentType: string;
  messageId: string;
  messageSubject: string;
  senderName: string;
  senderAddress: string;
  receivedDateTime: string;
  homeAccountId: string;
  direction: "received" | "sent";
}

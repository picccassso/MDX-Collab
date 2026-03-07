export interface FeedbackSubmission {
  uid: string;
  subject: string;
  message: string;
  route: string;
  contextLabel: string;
  userName?: string;
  userEmail?: string;
}

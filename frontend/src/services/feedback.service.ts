import { httpsCallable } from "firebase/functions";
import { functions } from "./firebase";
import type { FeedbackEntry, FeedbackSubmission } from "../types/feedback";

const MAX_SUBJECT_LENGTH = 80;
const MAX_MESSAGE_LENGTH = 2000;

type ListFeedbackResult = {
  status: string;
  feedback: FeedbackEntry[];
};

type SubmitFeedbackPayload = {
  subject: string;
  message: string;
  route: string;
  contextLabel: string;
  userName?: string;
  userEmail?: string;
};

type SubmitFeedbackResult = {
  status: string;
};

const listFeedbackCallable = httpsCallable<Record<string, never>, ListFeedbackResult>(
  functions,
  "listFeedback",
);

const submitFeedbackCallable = httpsCallable<SubmitFeedbackPayload, SubmitFeedbackResult>(
  functions,
  "submitFeedback",
);

function sanitizeField(value: string, maxLength: number): string {
  return value.trim().slice(0, maxLength);
}

export const FeedbackService = {
  async create(submission: FeedbackSubmission): Promise<void> {
    const subject = sanitizeField(submission.subject, MAX_SUBJECT_LENGTH);
    const message = sanitizeField(submission.message, MAX_MESSAGE_LENGTH);
    const route = submission.route.trim();
    const contextLabel = sanitizeField(submission.contextLabel, MAX_SUBJECT_LENGTH);

    if (!submission.uid.trim()) {
      throw new Error("You must be signed in to send feedback.");
    }

    if (!subject) {
      throw new Error("Choose a subject for your feedback.");
    }

    if (!message) {
      throw new Error("Enter some feedback before sending.");
    }

    await submitFeedbackCallable({
      subject,
      message,
      route,
      contextLabel,
      userName: submission.userName?.trim(),
      userEmail: submission.userEmail?.trim(),
    });
  },

  async list(): Promise<FeedbackEntry[]> {
    const result = await listFeedbackCallable({});
    return result.data.feedback ?? [];
  },
};

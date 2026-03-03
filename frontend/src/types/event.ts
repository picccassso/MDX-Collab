import type { Timestamp } from "firebase/firestore";

export interface EventItem {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  date: Timestamp;
  createdAt: Timestamp;
}

export interface EventProposal {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  date: Timestamp;
  authorId: string;
  authorName: string;
  status: "pending" | "approved" | "rejected";
  createdAt: Timestamp;
}

import type { Timestamp } from "firebase/firestore";

export interface CollaborationFile {
  name: string;
  url: string;
  type: string;
  size: number;
}

export interface Collaboration {
  id: string;
  title: string;
  description: string;
  authorId: string;
  authorName: string;
  collaborators: string[];
  tags: string[];
  files: CollaborationFile[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

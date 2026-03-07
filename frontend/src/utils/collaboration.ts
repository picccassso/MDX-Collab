import type { Collaboration, CollaborationFile } from "../types/collaboration";

type CollaborationMediaSource = Pick<Collaboration, "thumbnailUrl" | "files">;

export function isImageMimeType(type: string | null | undefined): boolean {
  return typeof type === "string" && type.startsWith("image/");
}

export function isCollaborationImageFile(
  file: CollaborationFile | null | undefined,
): file is CollaborationFile {
  return isImageMimeType(file?.type);
}

export function getCollaborationImageFiles(
  files: CollaborationFile[] | null | undefined,
): CollaborationFile[] {
  if (!Array.isArray(files)) return [];
  return files.filter(isCollaborationImageFile);
}

export function getCollaborationCoverImageUrl(
  collab: CollaborationMediaSource | null | undefined,
): string | null {
  const thumbnailUrl =
    typeof collab?.thumbnailUrl === "string" ? collab.thumbnailUrl.trim() : "";
  if (thumbnailUrl) return thumbnailUrl;
  return getCollaborationImageFiles(collab?.files)[0]?.url ?? null;
}

function normalizeSearchText(value: string | null | undefined): string {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

export function getCollaborationSearchScore(
  collab: Pick<Collaboration, "title" | "description" | "tags" | "authorName">,
  query: string,
): number {
  const normalizedQuery = normalizeSearchText(query);
  if (!normalizedQuery) return 0;

  const title = normalizeSearchText(collab.title);
  const description = normalizeSearchText(collab.description);
  const authorName = normalizeSearchText(collab.authorName);
  const tags = Array.isArray(collab.tags) ? collab.tags.map(normalizeSearchText).filter(Boolean) : [];
  const wholeText = [title, description, authorName, ...tags].filter(Boolean).join(" ");
  if (!wholeText.includes(normalizedQuery)) return 0;

  let score = 1;

  if (title === normalizedQuery) score += 120;
  else if (title.startsWith(normalizedQuery)) score += 80;
  else if (title.includes(normalizedQuery)) score += 50;

  if (tags.some((tag) => tag === normalizedQuery)) score += 70;
  else if (tags.some((tag) => tag.startsWith(normalizedQuery))) score += 45;
  else if (tags.some((tag) => tag.includes(normalizedQuery))) score += 25;

  if (authorName.startsWith(normalizedQuery)) score += 20;
  else if (authorName.includes(normalizedQuery)) score += 10;

  if (description.startsWith(normalizedQuery)) score += 12;
  else if (description.includes(normalizedQuery)) score += 6;

  return score;
}

export interface Repository {
  name: string;
  description: string | null;
  htmlUrl: string;
  createdAt: string;
  isPrivate: boolean;
  isFork: boolean;
  isArchived: boolean;
  topics: string[];
}

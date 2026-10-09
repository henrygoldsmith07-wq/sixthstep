export const sectors = ["All sectors", "Technology", "Engineering", "Healthcare", "Business & finance", "Law", "Creative & media", "Science & research", "Humanities & social sciences", "Explore careers"] as const;
export type Sector = typeof sectors[number];
export type Opportunity = {
  id: string; title: string; provider: string; sector: string;
  type: string;
  location: string; duration: string; eligibility: string; cost: string;
  deadline: string; url: string; description: string; tags: string[];
  checkedAt: string; source: "catalogue" | "web" | "imported" | "manual"; minAge?: number; maxAge?: number;
};
export type SavedOpportunity = Opportunity & {status: "Interested" | "Applied" | "Completed"; savedAt: string};

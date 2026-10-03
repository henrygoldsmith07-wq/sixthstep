import { z } from "zod";
export const sectors = ["All sectors", "Technology", "Engineering", "Healthcare", "Business & finance", "Law", "Creative & media", "Science & research", "Humanities & social sciences", "Explore careers"] as const;
export type Sector = typeof sectors[number];
export type Opportunity = {
  id: string; title: string; provider: string; sector: string;
  type: string;
  location: string; duration: string; eligibility: string; cost: string;
  deadline: string; url: string; description: string; tags: string[];
  checkedAt: string; source: "catalogue" | "web" | "imported" | "manual"; minAge?: number; maxAge?: number;
};
export const summarySchema = z.object({
  title: z.string().max(180), overview: z.string().max(1500),
  activities: z.array(z.string().max(500)).max(8), skills: z.array(z.string().max(150)).max(10),
  eligibility: z.string().max(600), duration: z.string().max(300),
  deadline: z.string().max(300), cost: z.string().max(300),
  steps: z.array(z.string().max(500)).max(8)
});
export type Summary = z.infer<typeof summarySchema>;
export const reflectionSchema = z.object({
  summary: z.string().max(2200), skills: z.array(z.string().max(300)).max(10),
  cvBullet: z.string().max(600), nextSteps: z.array(z.string().max(400)).max(5)
});
export type Reflection = z.infer<typeof reflectionSchema>;
export type SavedOpportunity = Opportunity & {status: "Interested" | "Applied" | "Completed"; savedAt: string};

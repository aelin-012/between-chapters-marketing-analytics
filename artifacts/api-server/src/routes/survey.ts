import { Router } from "express";
import { db, surveyResponsesTable } from "@workspace/db";
import { desc, sql, count, eq } from "drizzle-orm";
import { SubmitSurveyBody } from "@workspace/api-zod";

const router = Router();

router.post("/survey/responses", async (req, res) => {
  const parseResult = SubmitSurveyBody.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({ error: "Invalid request body", details: parseResult.error.issues });
    return;
  }

  const data = parseResult.data;

  const [created] = await db
    .insert(surveyResponsesTable)
    .values({
      respondentName: data.respondentName ?? null,
      respondentEmail: data.respondentEmail ?? null,
      howFound: data.howFound ?? null,
      overallRating: data.overallRating,
      mostValuableSection: data.mostValuableSection,
      wouldRecommend: data.wouldRecommend,
      wouldHire: data.wouldHire ?? null,
      openFeedback: data.openFeedback ?? null,
      marketingBackground: data.marketingBackground ?? null,
    })
    .returning();

  res.status(201).json({
    ...created,
    submittedAt: created.submittedAt.toISOString(),
  });
});

router.get("/survey/responses", async (_req, res) => {
  const rows = await db
    .select()
    .from(surveyResponsesTable)
    .orderBy(desc(surveyResponsesTable.submittedAt));

  res.json(
    rows.map((r) => ({
      ...r,
      submittedAt: r.submittedAt.toISOString(),
    }))
  );
});

router.get("/survey/analytics", async (_req, res) => {
  const allResponses = await db
    .select()
    .from(surveyResponsesTable)
    .orderBy(desc(surveyResponsesTable.submittedAt));

  const total = allResponses.length;

  if (total === 0) {
    res.json({
      totalResponses: 0,
      averageRating: 0,
      recommendRate: 0,
      hireRate: 0,
      ratingDistribution: [1, 2, 3, 4, 5].map((r) => ({ label: String(r), count: 0, percentage: 0 })),
      sectionPopularity: [],
      howFoundDistribution: [],
      backgroundDistribution: [],
      recentFeedback: [],
    });
    return;
  }

  const avgRating =
    allResponses.reduce((sum, r) => sum + r.overallRating, 0) / total;

  const recommendCount = allResponses.filter((r) => r.wouldRecommend).length;
  const hireCount = allResponses.filter((r) => r.wouldHire === true).length;
  const hireEligible = allResponses.filter((r) => r.wouldHire !== null).length;

  const ratingDistribution = [1, 2, 3, 4, 5].map((rating) => {
    const cnt = allResponses.filter((r) => r.overallRating === rating).length;
    return { label: `${rating} star${rating > 1 ? "s" : ""}`, count: cnt, percentage: Math.round((cnt / total) * 100) };
  });

  const sectionCounts: Record<string, number> = {};
  for (const r of allResponses) {
    sectionCounts[r.mostValuableSection] = (sectionCounts[r.mostValuableSection] ?? 0) + 1;
  }
  const sectionPopularity = Object.entries(sectionCounts)
    .map(([label, cnt]) => ({ label: formatLabel(label), count: cnt, percentage: Math.round((cnt / total) * 100) }))
    .sort((a, b) => b.count - a.count);

  const foundCounts: Record<string, number> = {};
  for (const r of allResponses) {
    if (r.howFound) {
      foundCounts[r.howFound] = (foundCounts[r.howFound] ?? 0) + 1;
    }
  }
  const howFoundDistribution = Object.entries(foundCounts)
    .map(([label, cnt]) => ({ label: formatLabel(label), count: cnt, percentage: Math.round((cnt / total) * 100) }))
    .sort((a, b) => b.count - a.count);

  const bgCounts: Record<string, number> = {};
  for (const r of allResponses) {
    if (r.marketingBackground) {
      bgCounts[r.marketingBackground] = (bgCounts[r.marketingBackground] ?? 0) + 1;
    }
  }
  const backgroundDistribution = Object.entries(bgCounts)
    .map(([label, cnt]) => ({ label: formatLabel(label), count: cnt, percentage: Math.round((cnt / total) * 100) }))
    .sort((a, b) => b.count - a.count);

  const recentFeedback = allResponses
    .filter((r) => r.openFeedback && r.openFeedback.trim().length > 0)
    .slice(0, 6)
    .map((r) => ({
      id: r.id,
      text: r.openFeedback!,
      rating: r.overallRating,
      name: r.respondentName ?? null,
      submittedAt: r.submittedAt.toISOString(),
    }));

  res.json({
    totalResponses: total,
    averageRating: Math.round(avgRating * 10) / 10,
    recommendRate: Math.round((recommendCount / total) * 100),
    hireRate: hireEligible > 0 ? Math.round((hireCount / hireEligible) * 100) : 0,
    ratingDistribution,
    sectionPopularity,
    howFoundDistribution,
    backgroundDistribution,
    recentFeedback,
  });
});

function formatLabel(key: string): string {
  return key
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default router;

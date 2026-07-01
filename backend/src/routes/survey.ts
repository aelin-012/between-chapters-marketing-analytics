import { Router } from "express";
import { db, surveyResponsesTable } from "@workspace/db";
import { desc } from "drizzle-orm";
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
      celebrationFrequency: data.celebrationFrequency,
      recentCelebration: data.recentCelebration,
      monthlyAestheticSpend: data.monthlyAestheticSpend,
      mostImportantFactor: data.mostImportantFactor,
      switchTriggers: data.switchTriggers ? data.switchTriggers.join(",") : null,
      packageChoice: data.packageChoice,
      biggestFear: data.biggestFear,
      perfectCelebration: data.perfectCelebration ?? null,
      bookingIntent: data.bookingIntent,
      respondentAge: data.respondentAge ?? null,
      respondentOccupation: data.respondentOccupation ?? null,
      respondentCity: data.respondentCity ?? null,
    })
    .returning();

  res.status(201).json({
    ...created,
    submittedAt: created.submittedAt.toISOString(),
  });
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
      bookingIntentScore: 0,
      celebrationFrequencyDistribution: [],
      recentCelebrationDistribution: [],
      spendDistribution: [],
      importantFactorDistribution: [],
      packageChoiceDistribution: [],
      biggestFearDistribution: [],
      switchTriggerDistribution: [],
      bookingIntentDistribution: [],
      perfectCelebrationWords: [],
    });
    return;
  }

  const intentWeights: Record<string, number> = { definitely: 100, maybe: 66, probably_not: 33, no: 0 };
  const intentScore =
    allResponses.reduce((sum, r) => sum + (intentWeights[r.bookingIntent] ?? 0), 0) / total;

  function distribution(key: keyof typeof allResponses[0]) {
    const counts: Record<string, number> = {};
    for (const r of allResponses) {
      const val = r[key] as string;
      if (val) counts[val] = (counts[val] ?? 0) + 1;
    }
    return Object.entries(counts)
      .map(([label, count]) => ({ label: formatLabel(label), count, percentage: Math.round((count / total) * 100) }))
      .sort((a, b) => b.count - a.count);
  }

  // Switch triggers are stored comma-separated
  const triggerCounts: Record<string, number> = {};
  for (const r of allResponses) {
    if (r.switchTriggers) {
      for (const t of r.switchTriggers.split(",")) {
        const trimmed = t.trim();
        if (trimmed) triggerCounts[trimmed] = (triggerCounts[trimmed] ?? 0) + 1;
      }
    }
  }
  const switchTriggerDistribution = Object.entries(triggerCounts)
    .map(([label, count]) => ({ label: formatLabel(label), count, percentage: Math.round((count / total) * 100) }))
    .sort((a, b) => b.count - a.count);

  // Word frequency for open answers
  const stopWords = new Set(["a", "an", "the", "and", "or", "but", "in", "on", "at", "to", "for", "of", "with", "is", "it", "i", "my", "me", "be", "that", "this", "just", "want", "would", "feel", "like", "very", "so", "do", "not", "have", "more", "all", "get", "can", "we", "they", "was", "are"]);
  const wordCounts: Record<string, number> = {};
  for (const r of allResponses) {
    if (r.perfectCelebration) {
      const words = r.perfectCelebration.toLowerCase().replace(/[^a-z\s]/g, "").split(/\s+/);
      for (const w of words) {
        if (w.length > 3 && !stopWords.has(w)) {
          wordCounts[w] = (wordCounts[w] ?? 0) + 1;
        }
      }
    }
  }
  const perfectCelebrationWords = Object.entries(wordCounts)
    .map(([word, count]) => ({ word, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 30);

  res.json({
    totalResponses: total,
    bookingIntentScore: Math.round(intentScore),
    celebrationFrequencyDistribution: distribution("celebrationFrequency"),
    recentCelebrationDistribution: distribution("recentCelebration"),
    spendDistribution: distribution("monthlyAestheticSpend"),
    importantFactorDistribution: distribution("mostImportantFactor"),
    packageChoiceDistribution: distribution("packageChoice"),
    biggestFearDistribution: distribution("biggestFear"),
    switchTriggerDistribution,
    bookingIntentDistribution: distribution("bookingIntent"),
    perfectCelebrationWords,
  });
});

function formatLabel(key: string): string {
  const map: Record<string, string> = {
    never: "Never",
    sometimes: "Sometimes",
    often: "Often",
    always: "Always",
    birthday: "Birthday",
    graduation: "Graduation",
    anniversary: "Anniversary",
    promotion: "Promotion",
    other: "Other",
    under_1000: "Under ₹1,000",
    between_1000_3000: "₹1,000–₹3,000",
    between_3000_6000: "₹3,000–₹6,000",
    above_6000: "₹6,000+",
    emotion: "Emotion / Memory",
    aesthetics: "Aesthetics / Photos",
    price: "Price",
    convenience: "Convenience",
    photos: "Photos / Content",
    personalization: "Personalization",
    unique_styling: "Unique Aesthetic Styling",
    emotional_touches: "Emotional / Personal Touches",
    better_photos: "Better Photos & Videos",
    less_stress: "Less Planning Stress",
    intimate_experience: "Intimate Experience",
    custom_themes: "Custom Themes",
    social_proof: "Seeing Someone Experience It First",
    moment: "The Moment (₹9,900)",
    story: "The Story (₹14,500)",
    chapter: "The Chapter (₹17,900)",
    late_execution: "Late Execution",
    looks_cheap: "Looks Cheap in Photos",
    too_expensive: "Too Expensive",
    feels_generic: "Feels Generic",
    no_personalization: "No Personalization",
    definitely: "Definitely",
    maybe: "Maybe",
    probably_not: "Probably Not",
    no: "No",
  };
  return map[key] ?? key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export default router;

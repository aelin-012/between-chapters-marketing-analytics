import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const surveyResponsesTable = pgTable("survey_responses", {
  id: serial("id").primaryKey(),
  respondentName: text("respondent_name"),
  respondentEmail: text("respondent_email"),
  howFound: text("how_found"),
  overallRating: integer("overall_rating").notNull(),
  mostValuableSection: text("most_valuable_section").notNull(),
  wouldRecommend: boolean("would_recommend").notNull(),
  wouldHire: boolean("would_hire"),
  openFeedback: text("open_feedback"),
  marketingBackground: text("marketing_background"),
  submittedAt: timestamp("submitted_at").defaultNow().notNull(),
});

export const insertSurveyResponseSchema = createInsertSchema(surveyResponsesTable).omit({
  id: true,
  submittedAt: true,
});

export type InsertSurveyResponse = z.infer<typeof insertSurveyResponseSchema>;
export type SurveyResponse = typeof surveyResponsesTable.$inferSelect;

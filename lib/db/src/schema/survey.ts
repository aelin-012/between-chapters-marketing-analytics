import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const surveyResponsesTable = pgTable("survey_responses", {
  id: serial("id").primaryKey(),
  celebrationFrequency: text("celebration_frequency").notNull(),
  recentCelebration: text("recent_celebration").notNull(),
  monthlyAestheticSpend: text("monthly_aesthetic_spend").notNull(),
  mostImportantFactor: text("most_important_factor").notNull(),
  switchTriggers: text("switch_triggers"),
  packageChoice: text("package_choice").notNull(),
  biggestFear: text("biggest_fear").notNull(),
  perfectCelebration: text("perfect_celebration"),
  bookingIntent: text("booking_intent").notNull(),
  respondentAge: text("respondent_age"),
  respondentOccupation: text("respondent_occupation"),
  respondentCity: text("respondent_city"),
  submittedAt: timestamp("submitted_at").defaultNow().notNull(),
});

export const insertSurveyResponseSchema = createInsertSchema(surveyResponsesTable).omit({
  id: true,
  submittedAt: true,
});

export type InsertSurveyResponse = z.infer<typeof insertSurveyResponseSchema>;
export type SurveyResponse = typeof surveyResponsesTable.$inferSelect;

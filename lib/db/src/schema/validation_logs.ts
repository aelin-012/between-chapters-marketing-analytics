import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { surveyResponsesTable } from "./survey";

export const validationLogsTable = pgTable("validation_logs", {
  id: serial("id").primaryKey(),
  responseId: integer("response_id")
    .references(() => surveyResponsesTable.id)
    .notNull(),
  payload: text("payload").notNull(),
  responseOutput: text("response_output").notNull(),
  loggedAt: timestamp("logged_at").defaultNow().notNull(),
});

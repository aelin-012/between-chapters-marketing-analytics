import React from "react";
import { Link } from "wouter";
import {
  useGetSurveyAnalytics,
  getGetSurveyAnalyticsQueryKey,
} from "@workspace/api-client-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { ArrowLeft, Users, Target, Activity, FileText } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const COLORS = [
  "hsl(16, 55%, 50%)", // Terracotta
  "hsl(126, 12%, 58%)", // Sage Green
  "hsl(27, 53%, 20%)", // Espresso
  "hsl(40, 30%, 70%)", // Dusty Beige
  "hsl(20, 40%, 60%)",
];

export default function Analytics() {
  const { data: analytics, isLoading: analyticsLoading } = useGetSurveyAnalytics({
    query: { queryKey: getGetSurveyAnalyticsQueryKey() },
  });

  if (analyticsLoading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <Skeleton className="h-12 w-48" />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <Skeleton className="h-[400px] w-full" />
            <Skeleton className="h-[400px] w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!analytics || analytics.totalResponses === 0) {
    return (
      <div className="min-h-screen bg-background p-6 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-6">
          <Activity className="w-8 h-8 text-muted-foreground" />
        </div>
        <h2 className="text-2xl font-serif mb-2 text-foreground">Validation Lab Empty</h2>
        <p className="text-muted-foreground mb-8">
          Be the first to respond to the survey and shape the brand.
        </p>
        <Link
          href="/"
          className="inline-flex items-center text-primary font-medium hover:underline"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Between Chapters
        </Link>
      </div>
    );
  }

  const topFactor =
    [...(analytics.importantFactorDistribution || [])].sort(
      (a, b) => b.count - a.count
    )[0]?.label || "None";

  const topPackage =
    [...(analytics.packageChoiceDistribution || [])].sort(
      (a, b) => b.count - a.count
    )[0]?.label || "None";

  return (
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/40">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="font-serif font-semibold text-xl tracking-tight text-foreground">
            Validation Lab
          </div>
          <Link
            href="/"
            className="inline-flex items-center text-sm font-medium hover:text-primary transition-colors text-muted-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Link>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-12 space-y-12">
        <div>
          <h1 className="text-4xl font-serif mb-3 text-foreground">
            Live Results
          </h1>
          <p className="text-muted-foreground text-lg">
            Real-time validation data driving Between Chapters.
          </p>
        </div>

        {/* Top Stats */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2 text-muted-foreground mb-2">
                <Users className="w-4 h-4" />
                <h3 className="text-sm font-medium uppercase tracking-wider">
                  Total Responses
                </h3>
              </div>
              <p className="text-4xl font-serif text-foreground">
                {analytics.totalResponses}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2 text-muted-foreground mb-2">
                <Target className="w-4 h-4" />
                <h3 className="text-sm font-medium uppercase tracking-wider">
                  Intent Score
                </h3>
              </div>
              <p className="text-4xl font-serif text-foreground">
                {analytics.bookingIntentScore.toFixed(0)}
                <span className="text-xl text-muted-foreground">/100</span>
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2 text-muted-foreground mb-2">
                <Activity className="w-4 h-4" />
                <h3 className="text-sm font-medium uppercase tracking-wider">
                  Top Purchase Driver
                </h3>
              </div>
              <p className="text-xl font-medium text-foreground capitalize mt-2 truncate">
                {topFactor.replace(/_/g, " ")}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2 text-muted-foreground mb-2">
                <FileText className="w-4 h-4" />
                <h3 className="text-sm font-medium uppercase tracking-wider">
                  Decoy Effect Winner
                </h3>
              </div>
              <p className="text-xl font-medium text-foreground capitalize mt-2 truncate">
                {topPackage}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-serif">
                Celebration Frequency
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.celebrationFrequencyDistribution}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="hsl(var(--border))"
                  />
                  <XAxis
                    dataKey="label"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) => val.charAt(0).toUpperCase() + val.slice(1)}
                  />
                  <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />
                  <RechartsTooltip
                    cursor={{ fill: "hsl(var(--muted))" }}
                    contentStyle={{
                      borderRadius: "8px",
                      border: "1px solid hsl(var(--border))",
                      background: "hsl(var(--background))",
                    }}
                  />
                  <Bar
                    dataKey="count"
                    fill="hsl(var(--primary))"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-serif">Recent Celebration Types</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analytics.recentCelebrationDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="count"
                    nameKey="label"
                  >
                    {analytics.recentCelebrationDistribution.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    contentStyle={{
                      borderRadius: "8px",
                      border: "1px solid hsl(var(--border))",
                      background: "hsl(var(--background))",
                    }}
                    formatter={(value: number, name: string) => [
                      value,
                      name.charAt(0).toUpperCase() + name.slice(1),
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-serif">What Matters Most</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={analytics.importantFactorDistribution}
                  layout="vertical"
                  margin={{ left: 50, right: 20 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    horizontal={false}
                    stroke="hsl(var(--border))"
                  />
                  <XAxis
                    type="number"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />
                  <YAxis
                    dataKey="label"
                    type="category"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    width={100}
                    tickFormatter={(val) => val.charAt(0).toUpperCase() + val.slice(1)}
                  />
                  <RechartsTooltip
                    cursor={{ fill: "hsl(var(--muted))" }}
                    contentStyle={{
                      borderRadius: "8px",
                      border: "1px solid hsl(var(--border))",
                      background: "hsl(var(--background))",
                    }}
                  />
                  <Bar
                    dataKey="count"
                    fill="hsl(var(--secondary))"
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-serif">Package Preference (Decoy Effect)</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.packageChoiceDistribution}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="hsl(var(--border))"
                  />
                  <XAxis
                    dataKey="label"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) => val.charAt(0).toUpperCase() + val.slice(1)}
                  />
                  <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />
                  <RechartsTooltip
                    cursor={{ fill: "hsl(var(--muted))" }}
                    contentStyle={{
                      borderRadius: "8px",
                      border: "1px solid hsl(var(--border))",
                      background: "hsl(var(--background))",
                    }}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {analytics.packageChoiceDistribution.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          entry.label === "story"
                            ? "hsl(var(--primary))"
                            : "hsl(var(--muted-foreground))"
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {analytics.perfectCelebrationWords &&
          analytics.perfectCelebrationWords.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="font-serif">
                  "Describe your perfect celebration"
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <div className="flex flex-wrap gap-4 justify-center items-center">
                  {analytics.perfectCelebrationWords.map((item, i) => (
                    <span
                      key={i}
                      className="text-foreground"
                      style={{
                        fontSize: `${Math.max(14, Math.min(48, 12 + item.count * 6))}px`,
                        opacity: Math.max(0.4, Math.min(1, 0.3 + item.count * 0.2)),
                        fontWeight: item.count > 3 ? 600 : 400,
                      }}
                    >
                      {item.word}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
      </main>
    </div>
  );
}
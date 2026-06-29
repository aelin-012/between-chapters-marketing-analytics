import React from "react";
import { Link } from "wouter";
import { 
  useGetSurveyAnalytics, 
  getGetSurveyAnalyticsQueryKey,
  useListSurveyResponses,
  getListSurveyResponsesQueryKey
} from "@workspace/api-client-react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from "recharts";
import { ArrowLeft, Users, Star, ThumbsUp, Briefcase } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const COLORS = ['hsl(10, 61%, 54%)', 'hsl(0, 0%, 20%)', 'hsl(40, 20%, 70%)', 'hsl(10, 40%, 70%)', 'hsl(40, 10%, 50%)'];

export default function Analytics() {
  const { data: analytics, isLoading: analyticsLoading } = useGetSurveyAnalytics({
    query: { queryKey: getGetSurveyAnalyticsQueryKey() }
  });

  const { data: responses, isLoading: responsesLoading } = useListSurveyResponses({
    query: { queryKey: getListSurveyResponsesQueryKey() }
  });

  if (analyticsLoading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <Skeleton className="h-12 w-48" />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32 w-full" />)}
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
          <BarChart className="w-8 h-8 text-muted-foreground" />
        </div>
        <h2 className="text-2xl font-serif mb-2">No data yet</h2>
        <p className="text-muted-foreground mb-8">Waiting for the first portfolio review to generate analytics.</p>
        <Link href="/" className="inline-flex items-center text-primary font-medium hover:underline">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Portfolio
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/40">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="font-serif font-semibold text-xl tracking-tight">Analytics</div>
          <Link href="/" className="inline-flex items-center text-sm font-medium hover:text-primary transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Link>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-12 space-y-12">
        <div>
          <h1 className="text-3xl font-serif mb-2">Feedback Dashboard</h1>
          <p className="text-muted-foreground">Live insights from portfolio visitors and reviewers.</p>
        </div>

        {/* Top Stats */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2 text-muted-foreground mb-2">
                <Users className="w-4 h-4" />
                <h3 className="text-sm font-medium uppercase tracking-wider">Responses</h3>
              </div>
              <p className="text-4xl font-serif">{analytics.totalResponses}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2 text-muted-foreground mb-2">
                <Star className="w-4 h-4" />
                <h3 className="text-sm font-medium uppercase tracking-wider">Avg Rating</h3>
              </div>
              <p className="text-4xl font-serif">{analytics.averageRating.toFixed(1)} <span className="text-xl text-muted-foreground">/ 5</span></p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2 text-muted-foreground mb-2">
                <ThumbsUp className="w-4 h-4" />
                <h3 className="text-sm font-medium uppercase tracking-wider">Recommend</h3>
              </div>
              <p className="text-4xl font-serif">{(analytics.recommendRate * 100).toFixed(0)}%</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2 text-muted-foreground mb-2">
                <Briefcase className="w-4 h-4" />
                <h3 className="text-sm font-medium uppercase tracking-wider">Would Hire</h3>
              </div>
              <p className="text-4xl font-serif">{(analytics.hireRate * 100).toFixed(0)}%</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-serif">Rating Distribution</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.ratingDistribution}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="label" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                  <RechartsTooltip 
                    cursor={{ fill: 'hsl(var(--muted))' }}
                    contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))' }}
                  />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-serif">Audience Background</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analytics.backgroundDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="count"
                  >
                    {analytics.backgroundDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="font-serif">Most Valuable Sections</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.sectionPopularity} layout="vertical" margin={{ left: 50 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                <YAxis dataKey="label" type="category" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} width={120} />
                <RechartsTooltip 
                  cursor={{ fill: 'hsl(var(--muted))' }}
                  contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))' }}
                />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Feedback Quotes */}
        {analytics.recentFeedback && analytics.recentFeedback.length > 0 && (
          <div>
            <h2 className="text-2xl font-serif mb-6">Recent Feedback</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {analytics.recentFeedback.map((feedback) => (
                <Card key={feedback.id} className="bg-muted/50 border-none shadow-none">
                  <CardContent className="p-6">
                    <div className="flex gap-1 mb-4 text-primary">
                      {[...Array(feedback.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-current" />
                      ))}
                    </div>
                    <p className="text-lg italic font-serif mb-4">"{feedback.text}"</p>
                    <p className="text-sm text-muted-foreground font-medium">— {feedback.name || "Anonymous"}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Raw Data List (Optional but requested to use all hooks) */}
        {responses && responses.length > 0 && (
          <div className="mt-12 pt-12 border-t">
             <h2 className="text-2xl font-serif mb-6">All Responses log</h2>
             <div className="overflow-x-auto">
               <table className="w-full text-sm text-left">
                 <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                   <tr>
                     <th className="px-4 py-3 font-medium">Date</th>
                     <th className="px-4 py-3 font-medium">Name</th>
                     <th className="px-4 py-3 font-medium">Rating</th>
                     <th className="px-4 py-3 font-medium">Background</th>
                   </tr>
                 </thead>
                 <tbody>
                   {responses.map(r => (
                     <tr key={r.id} className="border-b">
                       <td className="px-4 py-3">{new Date(r.submittedAt).toLocaleDateString()}</td>
                       <td className="px-4 py-3">{r.respondentName || 'Anonymous'}</td>
                       <td className="px-4 py-3">{r.overallRating}/5</td>
                       <td className="px-4 py-3">{r.marketingBackground || '-'}</td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
          </div>
        )}

      </main>
    </div>
  );
}

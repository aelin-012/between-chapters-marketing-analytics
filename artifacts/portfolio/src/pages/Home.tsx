import React, { useState } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useSubmitSurvey } from "@workspace/api-client-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const SurveyInputHowFound = {
  linkedin: "linkedin",
  google: "google",
  referral: "referral",
  social_media: "social_media",
  direct: "direct",
  other: "other",
} as const;

const SurveyInputMostValuableSection = {
  brand_identity: "brand_identity",
  target_audience: "target_audience",
  positioning: "positioning",
  marketing_mix: "marketing_mix",
  consumer_insights: "consumer_insights",
  campaign_strategy: "campaign_strategy",
  overall: "overall",
} as const;

const SurveyInputMarketingBackground = {
  student: "student",
  professional: "professional",
  entrepreneur: "entrepreneur",
  recruiter: "recruiter",
  curious: "curious",
  other: "other",
} as const;

const surveySchema = z.object({
  respondentName: z.string().optional(),
  respondentEmail: z.string().email().optional().or(z.literal("")),
  howFound: z.nativeEnum(SurveyInputHowFound).optional(),
  overallRating: z.number().min(1).max(5),
  mostValuableSection: z.nativeEnum(SurveyInputMostValuableSection),
  wouldRecommend: z.boolean(),
  wouldHire: z.boolean().optional(),
  openFeedback: z.string().optional(),
  marketingBackground: z.nativeEnum(SurveyInputMarketingBackground).optional(),
});

export default function Home() {
  const { toast } = useToast();
  const submitSurvey = useSubmitSurvey();
  const [submitted, setSubmitted] = useState(false);

  const form = useForm<z.infer<typeof surveySchema>>({
    resolver: zodResolver(surveySchema),
    defaultValues: {
      respondentName: "",
      respondentEmail: "",
      overallRating: 5,
      mostValuableSection: SurveyInputMostValuableSection.overall,
      wouldRecommend: true,
      wouldHire: false,
      openFeedback: "",
    },
  });

  const onSubmit = (values: z.infer<typeof surveySchema>) => {
    submitSurvey.mutate({ data: values }, {
      onSuccess: () => {
        setSubmitted(true);
        toast({
          title: "Thank you",
          description: "Your feedback has been received.",
        });
      },
      onError: () => {
        toast({
          title: "Error",
          description: "There was a problem submitting your survey.",
          variant: "destructive",
        });
      }
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/40">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="font-serif font-semibold text-xl tracking-tight">E.M.</div>
          <div className="flex gap-6 text-sm font-medium">
            <a href="#about" className="hover:text-primary transition-colors">About</a>
            <a href="#portfolio" className="hover:text-primary transition-colors">Portfolio</a>
            <a href="#survey" className="hover:text-primary transition-colors">Feedback</a>
            <Link href="/analytics" className="text-primary hover:text-primary/80 transition-colors">Analytics</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-24 px-6">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <p className="text-primary font-medium tracking-wide uppercase text-sm mb-4">The Self-Directed MBA</p>
            <h1 className="text-5xl md:text-7xl font-serif leading-[1.1] mb-8">
              Mastering marketing through deliberate practice.
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mb-12 font-sans">
              I bypassed the traditional classroom to build a curriculum rooted in real-world application. 
              This is my proof of work—a curated portfolio demonstrating strategic thinking, consumer empathy, and brand craftsmanship.
            </p>
            <a href="#portfolio" className="inline-flex items-center justify-center px-8 py-4 bg-primary text-primary-foreground font-medium rounded hover:bg-primary/90 transition-colors">
              Examine the Work
            </a>
          </motion.div>
        </div>
      </section>

      {/* Portfolio Case Study: Kumo Matcha */}
      <section id="portfolio" className="py-24 px-6 bg-card border-y border-border/40">
        <div className="max-w-5xl mx-auto">
          <div className="mb-16">
            <h2 className="text-3xl font-serif mb-4">Case Study: Kumo Matcha</h2>
            <p className="text-muted-foreground text-lg max-w-2xl">
              A comprehensive brand and go-to-market strategy for a hypothetical direct-to-consumer ceremonial matcha brand targeting high-performing professionals.
            </p>
          </div>

          <div className="space-y-24">
            {/* Section 1 */}
            <div className="grid md:grid-cols-[1fr_2fr] gap-8 items-start">
              <div>
                <h3 className="text-xl font-serif sticky top-24">01. Brand Identity</h3>
              </div>
              <div className="prose prose-stone">
                <p className="text-lg"><strong>Mission:</strong> To elevate the daily ritual, providing sustained focus without the jittery crash of coffee.</p>
                <p><strong>Values:</strong> Intentionality, Transparency, Craft.</p>
                <p><strong>Personality:</strong> Quietly confident, minimalist, deeply knowledgeable but never pretentious.</p>
                <div className="mt-8 p-8 bg-muted rounded flex items-center justify-center aspect-video">
                  <div className="font-serif text-4xl tracking-widest text-primary">KUMO</div>
                </div>
              </div>
            </div>

            {/* Section 2 */}
            <div className="grid md:grid-cols-[1fr_2fr] gap-8 items-start">
              <div>
                <h3 className="text-xl font-serif sticky top-24">02. Target Audience</h3>
              </div>
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="bg-background p-6 rounded border">
                  <h4 className="font-semibold mb-2">The "Mindful Optimizer"</h4>
                  <p className="text-sm text-muted-foreground mb-4">Age: 26-40 | Income: $80k+ | Urban</p>
                  <p className="text-sm">They view consumption as optimization. They track their sleep, value aesthetics, and are willing to pay a premium for products that align with their identity as a focused, healthy professional.</p>
                </div>
                <div className="bg-background p-6 rounded border">
                  <h4 className="font-semibold mb-2">Psychographics</h4>
                  <p className="text-sm text-muted-foreground mb-4">Values routine and aesthetics</p>
                  <p className="text-sm">They are exhausted by hustle culture but still ambitious. They seek "calm productivity" rather than manic energy.</p>
                </div>
              </div>
            </div>
            
            {/* Section 3 */}
            <div className="grid md:grid-cols-[1fr_2fr] gap-8 items-start">
              <div>
                <h3 className="text-xl font-serif sticky top-24">03. Brand Positioning</h3>
              </div>
              <div className="prose prose-stone">
                <blockquote className="border-l-2 border-primary pl-6 text-xl italic font-serif my-8">
                  For the ambitious professional seeking calm focus, Kumo is the ceremonial-grade matcha that transforms your morning rush into an intentional ritual.
                </blockquote>
                <p>Unlike massive coffee chains that sell pure caffeine, Kumo sells sustained clarity. Unlike legacy tea brands that feel outdated, Kumo feels like a modern lifestyle brand.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Survey */}
      <section id="survey" className="py-24 px-6">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-serif mb-4">Feedback & Review</h2>
            <p className="text-muted-foreground">
              Thank you for exploring my portfolio. I'd love to hear your thoughts on the work presented.
            </p>
          </div>

          <AnimatePresence mode="wait">
            {submitted ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-card p-12 text-center rounded-lg border shadow-sm"
              >
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 text-primary">
                  <Star className="w-8 h-8 fill-current" />
                </div>
                <h3 className="text-2xl font-serif mb-2">Feedback Received</h3>
                <p className="text-muted-foreground mb-8">Thank you for taking the time to review my portfolio.</p>
                <Link href="/analytics" className="text-primary font-medium hover:underline">
                  View Live Analytics Dashboard &rarr;
                </Link>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-card p-8 rounded-lg border shadow-sm"
              >
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    
                    <div className="grid sm:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="respondentName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Name (Optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="Jane Doe" {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="respondentEmail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email (Optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="jane@example.com" type="email" {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="overallRating"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Overall Rating</FormLabel>
                          <FormControl>
                            <div className="flex gap-2">
                              {[1, 2, 3, 4, 5].map((rating) => (
                                <button
                                  key={rating}
                                  type="button"
                                  onClick={() => field.onChange(rating)}
                                  className={`p-2 rounded-full transition-colors ${
                                    field.value >= rating ? "text-primary" : "text-muted hover:text-muted-foreground"
                                  }`}
                                >
                                  <Star className={`w-8 h-8 ${field.value >= rating ? "fill-current" : ""}`} />
                                </button>
                              ))}
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="mostValuableSection"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Most Valuable Section</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a section" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {Object.entries(SurveyInputMostValuableSection).map(([key, value]) => (
                                <SelectItem key={key} value={value}>
                                  {key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid sm:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="howFound"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>How did you find this site?</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select option" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {Object.entries(SurveyInputHowFound).map(([key, value]) => (
                                  <SelectItem key={key} value={value}>
                                    {key.charAt(0).toUpperCase() + key.slice(1)}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="marketingBackground"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Your Background</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select background" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {Object.entries(SurveyInputMarketingBackground).map(([key, value]) => (
                                  <SelectItem key={key} value={value}>
                                    {key.charAt(0).toUpperCase() + key.slice(1)}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="wouldRecommend"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>
                              Would you recommend this portfolio structure to others?
                            </FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="openFeedback"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Additional Feedback</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Any thoughts on the presentation, strategy, or writing?" 
                              className="resize-none min-h-[100px]"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button type="submit" className="w-full" disabled={submitSurvey.isPending}>
                      {submitSurvey.isPending ? "Submitting..." : "Submit Feedback"}
                    </Button>
                  </form>
                </Form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 text-center text-sm text-muted-foreground border-t">
        <p>© {new Date().getFullYear()} SelfMBA Portfolio. Created thoughtfully.</p>
      </footer>
    </div>
  );
}

import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { motion, useInView } from "framer-motion";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useSubmitSurvey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { ArrowDown, Check } from "lucide-react";

// ─── Enum constants (inline, no external imports) ───────────────────────────

const CelebrationFrequency = { never: "never", sometimes: "sometimes", often: "often", always: "always" } as const;
const RecentCelebration = { birthday: "birthday", graduation: "graduation", anniversary: "anniversary", promotion: "promotion", other: "other" } as const;
const MonthlySpend = { under_1000: "under_1000", between_1000_3000: "between_1000_3000", between_3000_6000: "between_3000_6000", above_6000: "above_6000" } as const;
const ImportantFactor = { emotion: "emotion", aesthetics: "aesthetics", price: "price", convenience: "convenience", photos: "photos", personalization: "personalization" } as const;
const SwitchTrigger = { unique_styling: "unique_styling", emotional_touches: "emotional_touches", better_photos: "better_photos", less_stress: "less_stress", intimate_experience: "intimate_experience", custom_themes: "custom_themes", social_proof: "social_proof" } as const;
const PackageChoice = { moment: "moment", story: "story", chapter: "chapter" } as const;
const BiggestFear = { late_execution: "late_execution", looks_cheap: "looks_cheap", too_expensive: "too_expensive", feels_generic: "feels_generic", no_personalization: "no_personalization" } as const;
const BookingIntent = { definitely: "definitely", maybe: "maybe", probably_not: "probably_not", no: "no" } as const;

// ─── Survey Schema ───────────────────────────────────────────────────────────

const surveySchema = z.object({
  celebrationFrequency: z.enum(["never", "sometimes", "often", "always"]),
  recentCelebration: z.enum(["birthday", "graduation", "anniversary", "promotion", "other"]),
  monthlyAestheticSpend: z.enum(["under_1000", "between_1000_3000", "between_3000_6000", "above_6000"]),
  mostImportantFactor: z.enum(["emotion", "aesthetics", "price", "convenience", "photos", "personalization"]),
  switchTriggers: z.array(z.string()).min(1, "Select at least one"),
  packageChoice: z.enum(["moment", "story", "chapter"]),
  biggestFear: z.enum(["late_execution", "looks_cheap", "too_expensive", "feels_generic", "no_personalization"]),
  perfectCelebration: z.string().optional(),
  bookingIntent: z.enum(["definitely", "maybe", "probably_not", "no"]),
  respondentAge: z.string().optional(),
  respondentOccupation: z.string().optional(),
  respondentCity: z.string().optional(),
});

type SurveyValues = z.infer<typeof surveySchema>;

// ─── Animated Counter ────────────────────────────────────────────────────────

function AnimatedNumber({ value, prefix = "", suffix = "" }: { value: string; prefix?: string; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const [displayed, setDisplayed] = useState("0");
  const numericValue = parseFloat(value.replace(/[^0-9.]/g, ""));

  useEffect(() => {
    if (!isInView) return;
    const duration = 1800;
    const start = performance.now();
    const isDecimal = value.includes(".");
    const frame = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = eased * numericValue;
      setDisplayed(isDecimal ? current.toFixed(2) : Math.floor(current).toLocaleString("en-IN"));
      if (progress < 1) requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  }, [isInView, numericValue, value]);

  return <span ref={ref}>{prefix}{displayed}{suffix}</span>;
}

// ─── Option Button ────────────────────────────────────────────────────────────

function OptionButton({ selected, onClick, children, dataTestId }: { selected: boolean; onClick: () => void; children: React.ReactNode; dataTestId?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-testid={dataTestId}
      className={`px-4 py-3 rounded-lg border text-sm text-left transition-all ${selected
        ? "border-primary bg-primary/10 text-primary font-medium"
        : "border-border bg-background hover:border-primary/50 hover:bg-primary/5"
      }`}
    >
      {selected && <Check className="inline w-3.5 h-3.5 mr-1.5 -mt-0.5" />}
      {children}
    </button>
  );
}

// ─── Section Wrapper ──────────────────────────────────────────────────────────

function Section({ id, className = "", children }: { id?: string; className?: string; children: React.ReactNode }) {
  return (
    <motion.section
      id={id}
      className={`py-20 px-6 ${className}`}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6 }}
    >
      {children}
    </motion.section>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-primary text-xs font-semibold tracking-[0.15em] uppercase mb-3">{children}</p>;
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return <h2 className="text-3xl md:text-4xl font-serif text-foreground mb-4">{children}</h2>;
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Home() {
  const { toast } = useToast();
  const submitSurvey = useSubmitSurvey();
  const [submitted, setSubmitted] = useState(false);

  const form = useForm<SurveyValues>({
    resolver: zodResolver(surveySchema),
    defaultValues: {
      celebrationFrequency: undefined,
      recentCelebration: undefined,
      monthlyAestheticSpend: undefined,
      mostImportantFactor: undefined,
      switchTriggers: [],
      packageChoice: undefined,
      biggestFear: undefined,
      perfectCelebration: "",
      bookingIntent: undefined,
      respondentAge: "",
      respondentOccupation: "",
      respondentCity: "",
    },
  });

  const onSubmit = (values: SurveyValues) => {
    console.log("[DEBUG] User clicked 'Submit to Validation Lab' with values:", values);
    submitSurvey.mutate(
      { data: { ...values, perfectCelebration: values.perfectCelebration || null, respondentAge: values.respondentAge || null, respondentOccupation: values.respondentOccupation || null, respondentCity: values.respondentCity || null } },
      {
        onSuccess: (data) => {
          console.log("[DEBUG] Validation Lab submission response successfully received:", data);
          setSubmitted(true);
          toast({ title: "Response recorded", description: "Thank you for helping shape Between Chapters." });
        },
        onError: (err) => {
          console.error("[DEBUG] Validation Lab submission failed with error:", err);
          toast({ title: "Something went wrong", description: "Please try again.", variant: "destructive" });
        },
      }
    );
  };

  const timeline = [
    { week: "Week 1", concept: "Brand Foundation", note: "Defined the mission, belief system, and the kind of person Between Chapters is for." },
    { week: "Week 2", concept: "Customer Avatar", note: "Mapped Anika — the ideal customer — in granular detail across demographics, psychographics, and motivations." },
    { week: "Week 3", concept: "Buying Journey", note: "Traced every stage from trigger to post-purchase, identifying exactly where trust breaks down." },
    { week: "Week 4", concept: "Behavioural Biases", note: "Selected Peak-End Rule, Pratfall Effect, and Reciprocity as the three lenses that shape every event design." },
    { week: "Week 5", concept: "JTBD Framework", note: "Articulated the functional, emotional, and social jobs the customer is truly hiring Between Chapters to do." },
    { week: "Week 6", concept: "Market Size", note: "Built a bottom-up TAM/SAM/SOM to validate the business case before any real investment." },
    { week: "Week 7", concept: "STP Strategy", note: "Chose Intentional Celebrators as the primary segment and wrote the positioning statement." },
    { week: "Week 8", concept: "Brand Identity", note: "Defined the Creator archetype, personality dimensions, tone of voice, and visual direction." },
    { week: "Week 9", concept: "Value Proposition", note: "Mapped customer pains and gains to specific product and service solutions." },
    { week: "Week 10", concept: "Pricing Strategy", note: "Applied the Decoy Effect to engineer a three-tier architecture that makes the target package feel like obvious value." },
    { week: "Week 11", concept: "Customer Validation", note: "Running live now — the Validation Lab below tests real hypotheses with real people." },
  ];

  return (
    <div className="min-h-screen bg-background font-sans">

      {/* ── Navigation ─────────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 bg-background/90 backdrop-blur-md border-b border-border/50">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="font-serif text-lg text-foreground tracking-tight">Between Chapters</span>
          <div className="hidden md:flex gap-6 text-sm">
            <a href="#about" className="text-muted-foreground hover:text-foreground transition-colors">About</a>
            <a href="#timeline" className="text-muted-foreground hover:text-foreground transition-colors">Journey</a>
            <a href="#brand" className="text-muted-foreground hover:text-foreground transition-colors">The Brand</a>
            <a href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
            <a href="#survey" className="text-muted-foreground hover:text-foreground transition-colors">Validation Lab</a>
            <Link href="/analytics" className="text-primary font-medium">Analytics</Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      <section className="pt-28 pb-24 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9 }}>
            <p className="text-primary text-xs font-semibold tracking-[0.15em] uppercase mb-6">A Self MBA Project</p>
            <h1 className="text-5xl md:text-7xl font-serif text-foreground leading-[1.08] mb-8">
              Building<br />Between Chapters
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl leading-relaxed mb-10">
              A real event brand built using marketing principles from Self MBA. Not a homework assignment —
              a living business experiment. Every concept applied immediately. Every decision documented here.
            </p>
            <div className="flex flex-wrap gap-3 mb-12">
              {["11 Concepts Applied", "29-page Brand Strategy", "Real Customer Research", "Live Analytics Dashboard"].map((pill) => (
                <span key={pill} className="px-4 py-2 bg-primary/10 text-primary text-sm font-medium rounded-full border border-primary/20">{pill}</span>
              ))}
            </div>
            <a href="#about" className="inline-flex items-center gap-2 text-muted-foreground text-sm hover:text-foreground transition-colors" data-testid="link-scroll-about">
              <ArrowDown className="w-4 h-4 animate-bounce" /> Scroll to explore
            </a>
          </motion.div>
        </div>
      </section>

      {/* ── About ──────────────────────────────────────────────────────────── */}
      <Section id="about" className="bg-card border-y border-border/40">
        <div className="max-w-3xl mx-auto">
          <SectionLabel>About This Project</SectionLabel>
          <SectionHeading>Instead of taking notes, I built a company.</SectionHeading>
          <div className="space-y-5 text-muted-foreground leading-relaxed text-lg">
            <p>
              Most people do Self MBA and collect insights. I wanted to do something different —
              apply every marketing concept immediately to a real brand as I learned it.
            </p>
            <p>
              Between Chapters is the result. It's a hypothetical event brand for Bangalore's young adults
              who believe celebrations should feel cinematic and personal, not generic and performative.
            </p>
            <p>
              Every framework you'll see on this page — the customer avatar, the bias stack, the pricing architecture —
              didn't exist as theory first. It was built as a decision. This website documents every one of them.
            </p>
          </div>
        </div>
      </Section>

      {/* ── Timeline ───────────────────────────────────────────────────────── */}
      <Section id="timeline">
        <div className="max-w-3xl mx-auto">
          <SectionLabel>The Journey</SectionLabel>
          <SectionHeading>11 weeks. 11 decisions.</SectionHeading>
          <div className="mt-12 relative">
            <div className="absolute left-[7px] top-2 bottom-2 w-px bg-border" />
            <div className="space-y-8">
              {timeline.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.04, duration: 0.4 }}
                  className="pl-8 relative"
                >
                  <div className="absolute left-0 top-1.5 w-3.5 h-3.5 rounded-full border-2 border-primary bg-background" />
                  <p className="text-xs text-primary font-semibold tracking-wider uppercase mb-0.5">{item.week}</p>
                  <p className="font-serif text-lg text-foreground">{item.concept}</p>
                  <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed">{item.note}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* ── Brand Foundation ───────────────────────────────────────────────── */}
      <Section id="brand" className="bg-card border-y border-border/40">
        <div className="max-w-5xl mx-auto">
          <SectionLabel>Week 1 — Brand Foundation</SectionLabel>
          <SectionHeading>Why Between Chapters exists.</SectionHeading>
          <div className="grid md:grid-cols-3 gap-6 mt-10">
            {[
              { label: "01 — The Change", text: "Between Chapters exists to change how young people experience celebrations — from generic, stressful, performative events into deeply personal, aesthetic, emotionally warm moments that feel cinematic, intimate, and true to them." },
              { label: "02 — The Person", text: "Her name is Anika. On a Tuesday between 2–4pm, she's working from a café with an iced coffee beside her while making Pinterest boards she'll never admit she spends hours on. She saves film-inspired birthday decor, romantic tablescapes, and cozy wedding reels." },
              { label: "03 — The Belief", text: "People don't remember perfect events — they remember how a moment made them feel, which is why every celebration should feel like a memory before it even becomes one." },
            ].map((card) => (
              <div key={card.label} className="bg-background p-7 rounded-xl border border-border/60">
                <p className="text-xs text-primary font-semibold tracking-wider uppercase mb-3">{card.label}</p>
                <p className="text-muted-foreground leading-relaxed text-sm">{card.text}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ── Customer Avatar ─────────────────────────────────────────────────── */}
      <Section>
        <div className="max-w-5xl mx-auto">
          <SectionLabel>Week 2 — Customer Avatar</SectionLabel>
          <SectionHeading>Meet Anika.</SectionHeading>
          <p className="text-muted-foreground mb-10 max-w-2xl">"Between Chapters is for the 20-year-old Bangalore girl who saves birthday-table setups on Pinterest at 1am, spends more time choosing the vibe than the venue, and believes the feeling of a celebration matters more than how expensive it looks."</p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            <div className="bg-card p-6 rounded-xl border border-border/60">
              <p className="text-xs text-muted-foreground font-semibold tracking-wider uppercase mb-4">Demographics</p>
              <div className="space-y-2 text-sm">
                {[["Age", "21"], ["City", "Bangalore"], ["Stage", "Final-year design student / social media intern"], ["Monthly budget", "₹12,000–₹18,000"], ["Style", "Intentional"]].map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-4">
                    <span className="text-muted-foreground">{k}</span>
                    <span className="text-foreground font-medium text-right">{v}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-card p-6 rounded-xl border border-border/60">
              <p className="text-xs text-muted-foreground font-semibold tracking-wider uppercase mb-4">Apps (in order)</p>
              <div className="flex flex-wrap gap-2">
                {["Instagram", "Pinterest", "WhatsApp", "Spotify"].map((app, i) => (
                  <span key={app} className="px-3 py-1.5 bg-background rounded-full text-sm border border-border">
                    <span className="text-muted-foreground text-xs mr-1">{i + 1}.</span>{app}
                  </span>
                ))}
              </div>
              <p className="text-xs text-muted-foreground font-semibold tracking-wider uppercase mb-3 mt-5">Buys drinks at</p>
              <p className="text-sm text-foreground">Blinkit / Cafés — iced coffee or matcha at 2pm</p>
            </div>
            <div className="bg-card p-6 rounded-xl border border-border/60">
              <p className="text-xs text-muted-foreground font-semibold tracking-wider uppercase mb-4">Psychographics</p>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Biggest fear</p>
                  <p className="text-foreground">"Living an ordinary, emotionally forgettable life where nothing feels meaningful."</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Wants to be seen as</p>
                  <p className="text-foreground">Effortlessly tasteful</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Primary motive</p>
                  <p className="text-foreground">Affiliation — belonging to a certain kind of emotional life</p>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-6 bg-primary/8 border border-primary/20 rounded-xl p-7">
            <p className="text-xs text-primary font-semibold tracking-wider uppercase mb-2">Deep Fear</p>
            <p className="text-foreground font-serif text-xl italic leading-relaxed">"I never want to become the person who rushes through life so fast that even their happiest moments feel emotionally empty and forgettable."</p>
          </div>
        </div>
      </Section>

      {/* ── Buying Journey ─────────────────────────────────────────────────── */}
      <Section className="bg-card border-y border-border/40">
        <div className="max-w-5xl mx-auto">
          <SectionLabel>Week 3 — Buying Journey</SectionLabel>
          <SectionHeading>Five stages. One truth: emotion drives everything.</SectionHeading>
          <div className="mt-10 space-y-4">
            {[
              {
                stage: "01 — Need Recognition", label: "The Trigger",
                content: "She sees someone else's aesthetic celebration on Instagram late at night. It's not envy — it's a feeling. 'My birthday shouldn't feel basic.' The trigger is less about events and more about wanting moments that feel cinematic, personal, and socially shareable.",
              },
              {
                stage: "02 — Information Search", label: "Where She Looks",
                content: "Pinterest and Instagram first — never Google. She searches 'aesthetic birthday setup Bangalore', 'intimate birthday ideas', 'scrapbook birthday'. She asks friends in WhatsApp. She judges credibility through real customer videos and unfiltered photos — not polished posters.",
              },
              {
                stage: "03 — Evaluation", label: "What She's Actually Deciding",
                content: "She compares Between Chapters to DIY setups, local decorators, café surprise packages. Key questions: 'Will this feel emotionally meaningful? Will it look aesthetic in photos? Will my friend actually feel special? Can I trust them not to ruin the surprise?'",
              },
              {
                stage: "04 — Purchase", label: "How She Buys",
                content: "Instagram DMs + UPI. Biggest friction point is trust — she fears the setup won't look like the photos, or that they'll arrive late. Best friction-removers: real customer videos, behind-the-scenes clips, fast DM replies, clear pricing.",
              },
              {
                stage: "05 — Post-Purchase", label: "THE MOST CRITICAL STAGE",
                content: "The brand grows through emotional word-of-mouth. The moment the birthday person cries, friends continuously repost stories, photos become profile pictures — that's when clients recommend Between Chapters. The memory becomes the actual product.",
                highlight: true,
              },
            ].map((s) => (
              <div key={s.stage} className={`p-6 rounded-xl border ${s.highlight ? "bg-primary/8 border-primary/25" : "bg-background border-border/60"}`}>
                <div className="flex flex-wrap gap-3 items-baseline mb-2">
                  <p className={`text-xs font-semibold tracking-wider uppercase ${s.highlight ? "text-primary" : "text-muted-foreground"}`}>{s.stage}</p>
                  <p className={`font-serif text-lg ${s.highlight ? "text-primary" : "text-foreground"}`}>{s.label}</p>
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed">{s.content}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ── Behavioural Biases ──────────────────────────────────────────────── */}
      <Section>
        <div className="max-w-5xl mx-auto">
          <SectionLabel>Week 4 — Behavioural Biases</SectionLabel>
          <SectionHeading>Three biases. One emotional system.</SectionHeading>
          <div className="grid md:grid-cols-3 gap-6 mt-10">
            {[
              {
                badge: "Primary", name: "Peak-End Rule",
                where: "Every event ending",
                action: "Every Between Chapters event ends with a small emotional ritual: handwritten notes, a memory wall, surprise photo reveals, or personalized takeaway gifts. People leave saying 'that ending felt unforgettable.' That final emotional imprint becomes the brand's strongest marketing.",
              },
              {
                badge: "Secondary", name: "Pratfall Effect",
                where: "Instagram reels & stories",
                action: "Show behind-the-scenes reels: setup struggles, last-minute fixes, team stress before surprise reveals, funny decoration mistakes. Gen Z connects more with honesty than perfection. This keeps the brand from feeling overly polished or corporate.",
              },
              {
                badge: "Reinforcing", name: "Reciprocity",
                where: "Every client interaction",
                action: "Free disposable cameras at events, edited candid photos sent after, handwritten thank-you cards, small personalized add-ons without charging extra. Clients feel so much goodwill they naturally share, recommend, and repost — without being asked.",
              },
            ].map((bias) => (
              <div key={bias.name} className="bg-card p-6 rounded-xl border border-border/60">
                <span className="inline-block px-2.5 py-1 text-xs font-semibold text-primary bg-primary/10 rounded-full mb-4">{bias.badge}</span>
                <h3 className="font-serif text-xl text-foreground mb-1">{bias.name}</h3>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-3">Applied at: {bias.where}</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{bias.action}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 bg-muted/40 rounded-xl border border-border/40 p-6">
            <p className="text-xs text-muted-foreground font-semibold tracking-wider uppercase mb-2">Bias Between Chapters will NOT use</p>
            <p className="font-serif text-lg text-foreground mb-2">Reactance Theory</p>
            <p className="text-sm text-muted-foreground leading-relaxed">No fake urgency. No 'only 2 slots left!!!'. No manipulative exclusivity. People should feel understood, not pressured. Overusing Reactance Theory would make the brand feel transactional instead of intimate and memory-driven.</p>
          </div>
        </div>
      </Section>

      {/* ── JTBD ───────────────────────────────────────────────────────────── */}
      <Section className="bg-card border-y border-border/40">
        <div className="max-w-5xl mx-auto">
          <SectionLabel>Week 5 — Jobs To Be Done</SectionLabel>
          <SectionHeading>What is she actually hiring Between Chapters to do?</SectionHeading>
          <div className="grid md:grid-cols-3 gap-6 mt-10">
            {[
              { type: "Functional Job", text: "When I want to celebrate an important moment with my friends, I want to organise an aesthetically planned and emotionally meaningful event, so I can create memories without the stress of managing everything myself." },
              { type: "Emotional Job", text: "When I feel disconnected from the fast and performative nature of most celebrations, I want to experience a warm and personal event, so I can feel emotionally present and genuinely connected to the people around me." },
              { type: "Social Job", text: "When I host a celebration or event, I want it to feel unique, cinematic, and thoughtfully curated, so I can express my identity and be remembered for creating meaningful experiences." },
            ].map((job) => (
              <div key={job.type} className="bg-background p-6 rounded-xl border border-border/60">
                <p className="text-xs text-primary font-semibold tracking-wider uppercase mb-3">{job.type}</p>
                <p className="text-foreground leading-relaxed text-sm italic font-serif text-base">"{job.text}"</p>
              </div>
            ))}
          </div>
          <div className="mt-8 p-6 rounded-xl border border-border/60 bg-background">
            <p className="text-xs text-muted-foreground font-semibold tracking-wider uppercase mb-2">Maslow's Hierarchy</p>
            <p className="text-foreground leading-relaxed text-sm">Between Chapters primarily operates on <strong>Level 3 — Love & Belonging</strong>, while also touching Level 4 — Esteem. The brand helps people feel emotionally connected, seen, and present with the people they care about. The aesthetic and cinematic nature of experiences also gives customers a sense of identity and social expression.</p>
          </div>
        </div>
      </Section>

      {/* ── Market Size ────────────────────────────────────────────────────── */}
      <Section>
        <div className="max-w-5xl mx-auto">
          <SectionLabel>Week 6 — Market Size</SectionLabel>
          <SectionHeading>How big is the opportunity?</SectionHeading>
          <div className="grid md:grid-cols-3 gap-6 mt-10">
            {[
              { label: "TAM", sublabel: "Total Addressable Market", value: "300", prefix: "₹", suffix: " Cr/yr", note: "370M Gen Z consumers. Bangalore alone has 5M young adults; 10% spend on experiences = 500K people × ₹4,000–₹8,000 per year." },
              { label: "SAM", sublabel: "Serviceable Available Market", value: "11.25", prefix: "₹", suffix: " Cr/yr", note: "75,000 culturally curious, highly online Bangaloreans. 3 paid experiences/year × ₹500 average ticket." },
              { label: "SOM", sublabel: "Obtainable Market (Year 1)", value: "48", prefix: "₹", suffix: " L/yr", note: "4 events/month × 200 attendees × ₹500 ticket. Realistic first-year target before memberships, partnerships, or multi-city expansion." },
            ].map((item) => (
              <div key={item.label} className="bg-card p-8 rounded-xl border border-border/60 text-center">
                <p className="text-xs text-muted-foreground font-semibold tracking-wider uppercase mb-1">{item.label}</p>
                <p className="text-xs text-muted-foreground mb-4">{item.sublabel}</p>
                <p className="text-4xl font-serif text-foreground mb-4">
                  <AnimatedNumber value={item.value} prefix={item.prefix} suffix={item.suffix} />
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed">{item.note}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 bg-muted/30 rounded-xl border border-border/40 p-6">
            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">One Nudge</p>
            <p className="text-sm text-muted-foreground leading-relaxed">Between Chapters grows through cultural social proof, not mass advertising. The goal is not maximum reach. The goal is becoming "the thing interesting people go to." If 15–20 culturally influential people in Bangalore consistently attend and post, the brand gains visibility inside tightly connected social circles where discovery is driven by taste and identity.</p>
          </div>
        </div>
      </Section>

      {/* ── STP ────────────────────────────────────────────────────────────── */}
      <Section className="bg-card border-y border-border/40">
        <div className="max-w-5xl mx-auto">
          <SectionLabel>Week 7 — STP Strategy</SectionLabel>
          <SectionHeading>Segmentation, Targeting, Positioning.</SectionHeading>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-10">
            {[
              { segment: "Intentional Celebrators", chosen: true, desc: "Young adults who value emotion over extravagance. Celebrate milestones with close friends or a partner. Authenticity and aesthetics over status." },
              { segment: "Social Trend Chasers", chosen: false, desc: "Love trendy, Instagram-worthy setups. Loyalty shifts quickly as trends evolve — not a stable base for a brand built on emotional depth." },
              { segment: "Convenience Seekers", chosen: false, desc: "Busy professionals who want someone else to organize with minimal effort. They prioritize speed and price over emotional storytelling." },
              { segment: "Luxury Experience Buyers", chosen: false, desc: "Motivated by exclusivity and status, not meaningful connection. Their values don't align with the brand's purpose." },
            ].map((s) => (
              <div key={s.segment} className={`p-5 rounded-xl border ${s.chosen ? "bg-primary/8 border-primary/30" : "bg-background border-border/60 opacity-75"}`}>
                {s.chosen && <span className="inline-block px-2 py-0.5 text-xs font-semibold bg-primary text-primary-foreground rounded-full mb-3">Chosen</span>}
                <p className={`font-serif text-base mb-2 ${s.chosen ? "text-foreground" : "text-muted-foreground"}`}>{s.segment}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 border-l-2 border-primary pl-6">
            <p className="text-xs text-muted-foreground font-semibold tracking-wider uppercase mb-2">Positioning Statement</p>
            <p className="font-serif text-lg text-foreground italic leading-relaxed">
              "For young adults who want to celebrate life's milestones in a meaningful and aesthetically beautiful way, Between Chapters is the curated celebration experience brand that transforms ordinary occasions into intimate, story-worthy memories, because every experience is thoughtfully designed around emotion, connection, and personal identity rather than generic event packages."
            </p>
          </div>
        </div>
      </Section>

      {/* ── Brand Identity ──────────────────────────────────────────────────── */}
      <Section>
        <div className="max-w-5xl mx-auto">
          <SectionLabel>Week 8 — Brand Identity</SectionLabel>
          <SectionHeading>The Creator archetype meets quiet confidence.</SectionHeading>
          <div className="grid md:grid-cols-2 gap-8 mt-10">
            <div className="space-y-6">
              <div className="bg-card p-6 rounded-xl border border-border/60">
                <p className="text-xs text-muted-foreground font-semibold tracking-wider uppercase mb-4">Personality (Jennifer Aaker)</p>
                {[["Sincerity", 9], ["Competence", 8], ["Sophistication", 8], ["Excitement", 7], ["Ruggedness", 2]].map(([trait, score]) => (
                  <div key={trait as string} className="mb-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-foreground">{trait}</span>
                      <span className="text-muted-foreground">{score}/10</span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full">
                      <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${(score as number) * 10}%` }} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="bg-card p-6 rounded-xl border border-border/60">
                <p className="text-xs text-muted-foreground font-semibold tracking-wider uppercase mb-3">Visual Direction</p>
                <div className="flex gap-2 mb-3">
                  {[["#F9F6F0", "Warm Ivory"], ["#8A9E8C", "Sage Green"], ["#C4603A", "Terracotta"], ["#D4C4A0", "Dusty Beige"], ["#1A1008", "Espresso"]].map(([hex, name]) => (
                    <div key={hex} className="flex-1 text-center">
                      <div className="h-10 rounded-md mb-1 border border-border/40" style={{ background: hex }} />
                      <p className="text-[9px] text-muted-foreground leading-tight">{name}</p>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed mt-2">Cormorant Garamond for headings + DM Sans for body. Intentional. Never ornamental.</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="bg-card p-6 rounded-xl border border-border/60">
                <p className="text-xs text-muted-foreground font-semibold tracking-wider uppercase mb-4">Tone of Voice</p>
                <div className="space-y-3">
                  <div className="p-4 bg-background rounded-lg border border-border/60">
                    <p className="text-xs text-green-600 font-semibold mb-2">In voice</p>
                    <p className="text-sm text-foreground italic">"Some celebrations don't need a ballroom. Just your favourite people, soft music, flowers on the table, and a moment that feels entirely yours."</p>
                  </div>
                  <div className="p-4 bg-background rounded-lg border border-border/60">
                    <p className="text-xs text-destructive font-semibold mb-2">Off voice</p>
                    <p className="text-sm text-muted-foreground line-through">"BIGGEST PARTY OF THE YEAR! LIMITED SLOTS — Book NOW before prices go up!! Most EPIC celebrations in Bangalore!!"</p>
                  </div>
                </div>
              </div>
              <div className="bg-card p-6 rounded-xl border border-border/60">
                <p className="text-xs text-muted-foreground font-semibold tracking-wider uppercase mb-2">The Acid Test</p>
                <p className="text-sm text-muted-foreground italic leading-relaxed">"Between Chapters is the friend who remembers everyone's favourite flowers, spends Saturday mornings wandering through cafés and local markets collecting inspiration, and would never choose something simply because it's trendy if it doesn't make people feel genuinely connected."</p>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* ── Value Proposition ──────────────────────────────────────────────── */}
      <Section className="bg-card border-y border-border/40">
        <div className="max-w-5xl mx-auto">
          <SectionLabel>Week 9 — Value Proposition</SectionLabel>
          <SectionHeading>Matching pains to solutions.</SectionHeading>
          <div className="grid md:grid-cols-3 gap-6 mt-10">
            {[
              { label: "Customer Pains", color: "text-destructive", items: ["Generic, cookie-cutter celebrations that feel impersonal", "Planning an aesthetic event is overwhelming — coordinating vendors takes weeks", "Celebrations become more about Instagram than about the people being celebrated"] },
              { label: "Between Chapters Solutions", color: "text-primary", items: ["Every event begins with the client's story, interests, and personality before any design decision", "Between Chapters manages creative direction, vendor coordination, styling, and execution end-to-end", "Experiences designed around emotion and intimate moments — not social media trends"] },
              { label: "Customer Gains", color: "text-green-600", items: ["A celebration that feels deeply personal and reflects their personality", "Beautiful aesthetics that feel timeless rather than trendy", "An effortless planning experience while still feeling involved in the creative process"] },
            ].map((col) => (
              <div key={col.label} className="bg-background p-6 rounded-xl border border-border/60">
                <p className={`text-xs font-semibold tracking-wider uppercase mb-4 ${col.color}`}>{col.label}</p>
                <ul className="space-y-3">
                  {col.items.map((item, i) => (
                    <li key={i} className="text-sm text-muted-foreground leading-relaxed pl-3 border-l border-border">{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-8 border-l-2 border-primary pl-6">
            <p className="font-serif text-lg text-foreground italic leading-relaxed">"For young adults like Anika who want to celebrate life's milestones in a way that feels deeply personal rather than performative, Between Chapters is a bespoke celebration design brand that transforms meaningful moments into beautifully curated experiences, because every event is built around the client's story — not a template."</p>
          </div>
        </div>
      </Section>

      {/* ── Pricing ────────────────────────────────────────────────────────── */}
      <Section id="pricing">
        <div className="max-w-5xl mx-auto">
          <SectionLabel>Week 10 — Pricing Strategy</SectionLabel>
          <SectionHeading>Three tiers. One psychological nudge.</SectionHeading>
          <p className="text-muted-foreground mb-2 max-w-2xl">The Decoy Effect: The Chapter (₹17,900) exists to make The Story (₹14,500) feel like exceptional value — the same emotional experience at ₹3,400 less.</p>
          <p className="text-xs text-muted-foreground mb-10">Cost floor: ₹9,100 (₹7,000 cost + 30% margin) &nbsp;·&nbsp; Value-based target: ₹14,500 &nbsp;·&nbsp; Anchored by: ₹17,900</p>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              { name: "The Moment", price: "₹9,900", badge: null, desc: "Perfect for birthdays, surprises, or small celebrations. Entry package for first-time customers.", features: ["Signature styling", "Basic personalization", "Vendor coordination"] },
              { name: "The Story", price: "₹14,500", badge: "Most Popular", desc: "Enhanced styling, personalization, planning and photography coordination.", features: ["Everything in The Moment", "Enhanced personalization", "Photography coordination", "Creative theme development"] },
              { name: "The Chapter", price: "₹17,900", badge: "Decoy", desc: "Premium decor upgrades, multiple activity zones, and extended planning support.", features: ["Everything in The Story", "Premium decor upgrades", "Multiple activity zones", "Extended planning support"] },
            ].map((pkg) => (
              <div key={pkg.name} className={`p-7 rounded-xl border ${pkg.badge === "Most Popular" ? "border-primary bg-primary/5 ring-1 ring-primary/20" : "border-border/60 bg-card"}`}>
                {pkg.badge && <span className={`inline-block px-2.5 py-0.5 text-xs font-semibold rounded-full mb-4 ${pkg.badge === "Most Popular" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>{pkg.badge}</span>}
                <h3 className="font-serif text-xl text-foreground mb-1">{pkg.name}</h3>
                <p className="text-3xl font-serif text-foreground mb-2">{pkg.price}</p>
                <p className="text-sm text-muted-foreground mb-5 leading-relaxed">{pkg.desc}</p>
                <ul className="space-y-2">
                  {pkg.features.map((f) => <li key={f} className="text-xs text-muted-foreground flex gap-2"><Check className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" />{f}</li>)}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-5 bg-muted/30 rounded-xl border border-border/40 p-6 flex flex-wrap gap-6 items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">Introductory Offer</p>
              <p className="font-serif text-xl text-foreground">First Celebration — <span className="text-primary">₹13,500</span></p>
              <p className="text-sm text-muted-foreground mt-1">Mini personalization, signature styling, one premium add-on. Save ~7% vs regular pricing.</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Reduces hesitation for</p>
              <p className="text-sm text-foreground font-medium">first-time customers</p>
            </div>
          </div>
        </div>
      </Section>

      {/* ── Validation Lab ─────────────────────────────────────────────────── */}
      <Section id="survey" className="bg-card border-y border-border/40">
        <div className="max-w-3xl mx-auto">
          <SectionLabel>Week 11 — Customer Validation</SectionLabel>
          <SectionHeading>Help shape Between Chapters.</SectionHeading>
          <p className="text-muted-foreground mb-2 max-w-2xl">I'm building this brand publicly. Each question here validates a real marketing hypothesis. Your answers directly influence the strategy — and feed the live analytics dashboard.</p>
          <div className="flex flex-wrap gap-3 mb-10 text-xs text-muted-foreground">
            {["Frequency Analysis", "Demand Segmentation", "Pricing Analysis", "Conversion Trigger", "Decoy Effect Test", "Pain Validation", "Intent Score"].map((h) => (
              <span key={h} className="px-2.5 py-1 bg-background border border-border/60 rounded-full">{h}</span>
            ))}
          </div>

          {submitted ? (
            <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="bg-background rounded-xl border border-border/60 p-12 text-center">
              <div className="w-14 h-14 rounded-full bg-primary/15 flex items-center justify-center mx-auto mb-6">
                <Check className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-serif text-2xl text-foreground mb-2">Response Recorded</h3>
              <p className="text-muted-foreground mb-8 max-w-sm mx-auto">Thank you. Your answers will shape the next version of Between Chapters.</p>
              <Link href="/analytics" className="inline-flex items-center gap-2 text-primary font-medium hover:underline" data-testid="link-view-analytics">
                View live analytics dashboard
              </Link>
            </motion.div>
          ) : (
            <div className="bg-background rounded-xl border border-border/60 p-8">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">

                  {/* Q1 */}
                  <FormField control={form.control} name="celebrationFrequency" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-serif text-foreground" data-testid="label-celebration-frequency">How often do you celebrate milestones?</FormLabel>
                      <p className="text-xs text-muted-foreground mb-3">Hypothesis: Frequency Analysis — validates market demand</p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {[["never", "Never"], ["sometimes", "Sometimes"], ["often", "Often"], ["always", "Always"]].map(([val, label]) => (
                          <OptionButton key={val} selected={field.value === val} onClick={() => field.onChange(val)} dataTestId={`option-frequency-${val}`}>{label}</OptionButton>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )} />

                  {/* Q2 */}
                  <FormField control={form.control} name="recentCelebration" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-serif text-foreground">Most recent celebration?</FormLabel>
                      <p className="text-xs text-muted-foreground mb-3">Hypothesis: Demand Segmentation</p>
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                        {[["birthday", "Birthday"], ["graduation", "Graduation"], ["anniversary", "Anniversary"], ["promotion", "Promotion"], ["other", "Other"]].map(([val, label]) => (
                          <OptionButton key={val} selected={field.value === val} onClick={() => field.onChange(val)} dataTestId={`option-celebration-${val}`}>{label}</OptionButton>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )} />

                  {/* Q3 */}
                  <FormField control={form.control} name="monthlyAestheticSpend" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-serif text-foreground">Monthly spend on aesthetic or meaningful experiences?</FormLabel>
                      <p className="text-xs text-muted-foreground mb-3">Hypothesis: Pricing Analysis — cafés, flowers, gifts, décor, candles, small celebrations</p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {[["under_1000", "Under ₹1,000"], ["between_1000_3000", "₹1,000–₹3,000"], ["between_3000_6000", "₹3,000–₹6,000"], ["above_6000", "₹6,000+"]].map(([val, label]) => (
                          <OptionButton key={val} selected={field.value === val} onClick={() => field.onChange(val)} dataTestId={`option-spend-${val}`}>{label}</OptionButton>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )} />

                  {/* Q4 */}
                  <FormField control={form.control} name="mostImportantFactor" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-serif text-foreground">If you could choose only ONE thing that matters in a celebration?</FormLabel>
                      <p className="text-xs text-muted-foreground mb-3">Hypothesis: Purchase Driver — reveals the true emotional driver behind behaviour</p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {[["emotion", "Emotion / Memory"], ["aesthetics", "Aesthetics / Photos"], ["price", "Price"], ["convenience", "Convenience"], ["photos", "Photos / Content"], ["personalization", "Personalization"]].map(([val, label]) => (
                          <OptionButton key={val} selected={field.value === val} onClick={() => field.onChange(val)} dataTestId={`option-factor-${val}`}>{label}</OptionButton>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )} />

                  {/* Q5 multi-select */}
                  <Controller control={form.control} name="switchTriggers" render={({ field, fieldState }) => (
                    <div className="space-y-2">
                      <label className="text-base font-serif text-foreground block">What would make you choose a professionally curated celebration? Select all that apply.</label>
                      <p className="text-xs text-muted-foreground mb-3">Hypothesis: Conversion Trigger — identifies what actually converts</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {[["unique_styling", "Unique aesthetic styling"], ["emotional_touches", "Emotional / personal touches"], ["better_photos", "Better photos & videos"], ["less_stress", "Less planning stress"], ["intimate_experience", "Intimate experience"], ["custom_themes", "Custom themes / details"], ["social_proof", "Seeing someone else experience it first"]].map(([val, label]) => {
                          const currentVal = field.value ?? [];
                          const selected = currentVal.includes(val);
                          return (
                            <OptionButton key={val} selected={selected} onClick={() => { const next = selected ? currentVal.filter((v) => v !== val) : [...currentVal, val]; field.onChange(next); }} dataTestId={`option-trigger-${val}`}>{label}</OptionButton>
                          );
                        })}
                      </div>
                      {fieldState.error && <p className="text-destructive text-sm mt-1">{fieldState.error.message}</p>}
                    </div>
                  )} />

                  {/* Q6 - Pricing test */}
                  <FormField control={form.control} name="packageChoice" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-serif text-foreground">Which package would you choose?</FormLabel>
                      <p className="text-xs text-muted-foreground mb-3">Hypothesis: Decoy Effect Test — validating pricing psychology in action</p>
                      <div className="grid md:grid-cols-3 gap-3">
                        {[
                          { val: "moment", name: "The Moment", price: "₹9,900", desc: "Signature styling + basic personalization" },
                          { val: "story", name: "The Story", price: "₹14,500", desc: "Enhanced styling, personalization + photography" },
                          { val: "chapter", name: "The Chapter", price: "₹17,900", desc: "Premium decor, multiple zones + extended support" },
                        ].map((pkg) => (
                          <button type="button" key={pkg.val} onClick={() => field.onChange(pkg.val)} data-testid={`option-package-${pkg.val}`}
                            className={`p-4 rounded-lg border text-left transition-all ${field.value === pkg.val ? "border-primary bg-primary/10 ring-1 ring-primary/20" : "border-border/60 bg-background hover:border-primary/40"}`}>
                            <p className={`font-medium text-sm mb-1 ${field.value === pkg.val ? "text-primary" : "text-foreground"}`}>{pkg.name}</p>
                            <p className="font-serif text-xl text-foreground mb-1">{pkg.price}</p>
                            <p className="text-xs text-muted-foreground leading-snug">{pkg.desc}</p>
                          </button>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )} />

                  {/* Q7 */}
                  <FormField control={form.control} name="biggestFear" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-serif text-foreground">What's your biggest fear about hiring a celebration planner?</FormLabel>
                      <p className="text-xs text-muted-foreground mb-3">Hypothesis: Pain Validation — validates pains Between Chapters must address</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {[["late_execution", "Late execution"], ["looks_cheap", "Looks cheap in photos"], ["too_expensive", "Too expensive"], ["feels_generic", "Feels generic, not personal"], ["no_personalization", "No real personalization"]].map(([val, label]) => (
                          <OptionButton key={val} selected={field.value === val} onClick={() => field.onChange(val)} dataTestId={`option-fear-${val}`}>{label}</OptionButton>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )} />

                  {/* Q8 */}
                  <FormField control={form.control} name="perfectCelebration" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-serif text-foreground">Describe your perfect celebration in a few words. (Optional)</FormLabel>
                      <p className="text-xs text-muted-foreground mb-3">Hypothesis: Qualitative Insights — feeds the word cloud in analytics</p>
                      <FormControl>
                        <Textarea placeholder="Close friends, flowers on the table, soft music, something that doesn't feel rushed..." className="resize-none" {...field} data-testid="input-perfect-celebration" />
                      </FormControl>
                    </FormItem>
                  )} />

                  {/* Q9 */}
                  <FormField control={form.control} name="bookingIntent" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-serif text-foreground">Would you actually book Between Chapters?</FormLabel>
                      <p className="text-xs text-muted-foreground mb-3">Hypothesis: Intent Score — weighted 0–100 and tracked in analytics</p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {[["definitely", "Definitely"], ["maybe", "Maybe"], ["probably_not", "Probably not"], ["no", "No"]].map(([val, label]) => (
                          <OptionButton key={val} selected={field.value === val} onClick={() => field.onChange(val)} dataTestId={`option-intent-${val}`}>{label}</OptionButton>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )} />

                  {/* Demographics */}
                  <div>
                    <p className="text-base font-serif text-foreground mb-1">A little about you (Optional)</p>
                    <p className="text-xs text-muted-foreground mb-4">Helps with demographic segmentation in analytics.</p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <FormField control={form.control} name="respondentAge" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs text-muted-foreground">Age</FormLabel>
                          <FormControl><Input placeholder="e.g. 23" {...field} data-testid="input-age" /></FormControl>
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="respondentOccupation" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs text-muted-foreground">Occupation</FormLabel>
                          <FormControl><Input placeholder="e.g. Designer" {...field} data-testid="input-occupation" /></FormControl>
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="respondentCity" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs text-muted-foreground">City</FormLabel>
                          <FormControl><Input placeholder="e.g. Bangalore" {...field} data-testid="input-city" /></FormControl>
                        </FormItem>
                      )} />
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={submitSurvey.isPending} data-testid="button-submit-survey">
                    {submitSurvey.isPending ? "Submitting..." : "Submit to Validation Lab"}
                  </Button>
                </form>
              </Form>
            </div>
          )}
        </div>
      </Section>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <footer className="py-10 px-6 text-center text-sm text-muted-foreground border-t border-border/40">
        <p className="font-serif text-base text-foreground mb-1">Between Chapters</p>
        <p>A Self MBA project. Built publicly. Every decision documented.</p>
        <Link href="/analytics" className="text-primary hover:underline mt-3 inline-block text-xs" data-testid="link-footer-analytics">View Validation Lab Analytics</Link>
      </footer>
    </div>
  );
}

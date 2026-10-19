import Link from 'next/link';
import { ArrowRight, Zap, CheckCircle, BarChart3, Briefcase, GraduationCap, FileText } from 'lucide-react';
import { Navbar } from '@/components/layout/navbar';

const features = [
  {
    title: 'Profile Analysis',
    description: 'Connect GitHub, LinkedIn, or upload your resume to get a complete skills assessment.',
    icon: Zap,
  },
  {
    title: 'Skill Graphs',
    description: 'Visualize your technical and soft skills with interactive charts.',
    icon: BarChart3,
  },
  {
    title: 'Job Matching',
    description: 'Get targeted job and internship recommendations based on your profile.',
    icon: Briefcase,
  },
  {
    title: 'ATS Scoring',
    description: 'Analyze your resume for ATS compatibility and get actionable feedback.',
    icon: CheckCircle,
  },
  {
    title: 'Learning Path',
    description: 'Prioritized roadmap with free and paid resources to close skill gaps.',
    icon: GraduationCap,
  },
  {
    title: 'PDF Reports',
    description: 'Generate and download professional analysis reports to share.',
    icon: FileText,
  },
];

const steps = [
  {
    step: '1',
    title: 'Connect your profiles',
    description: 'Add your GitHub, LinkedIn, portfolio links, or upload your resume.',
  },
  {
    step: '2',
    title: 'AI analysis',
    description: 'Our AI analyzes your skills, experience, and matches you with relevant roles.',
  },
  {
    step: '3',
    title: 'Get recommendations',
    description: 'Receive job matches, ATS score, and a prioritized learning path.',
  },
];

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <section className="relative flex flex-col items-center justify-center overflow-hidden pt-12 pb-20 px-4 text-center sm:pt-16 lg:pt-20 lg:pb-24">
        <div className="mx-auto max-w-3xl">
          <div className="flex flex-col items-center justify-center text-center">
            <span className="px-3 py-1 rounded-full border border-border bg-secondary text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Career Intelligence Platform
            </span>
            <h1 className="mt-6 text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Build your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-primary">
                next role strategy
              </span>
            </h1>
            <p className="mt-4 text-base text-muted-foreground max-w-xl sm:text-lg">
              Connect your professional profiles, evaluate your skills with AI,
              get targeted job recommendations, and follow a personalized learning path.
            </p>
            <div className="mt-6 flex items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/dashboard"
                className="inline-flex h-10 items-center rounded-md bg-primary text-sm font-medium text-primary-foreground shadow-sm shadow-primary/20 hover:bg-primary-hover transition-colors px-5"
              >
                Start Analyzing <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <Link
                href="#features"
                className="inline-flex h-10 items-center rounded-md border border-input bg-background px-5 text-sm font-medium text-foreground hover:bg-secondary transition-colors"
              >
                See Features
              </Link>
            </div>
          </div>
        </div>

        <div className="absolute top-0 left-0 w-full h-full -z-10 bg-gradient-to-b from-primary/5 via-background to-background/5" />
      </section>

      <section id="features" className="scroll-mt-16 py-16 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Everything you need to level up
            </h2>
            <p className="mt-2 text-base text-muted-foreground">
              AI-powered insights to take your career to the next level.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-xl border border-border bg-card p-5 hover:border-primary/50 transition-colors group"
              >
                <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-3 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="h-4 w-4" />
                </div>
                <h3 className="font-heading font-bold text-base mb-1">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="scroll-mt-16 py-16 bg-secondary/30 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              How it works
            </h2>
            <p className="mt-2 text-base text-muted-foreground">
              From profile to career roadmap in minutes.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-3">
            {steps.map((step) => (
              <div key={step.step} className="flex flex-col items-center text-center p-5">
                <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-base mb-3">
                  {step.step}
                </div>
                <h3 className="font-heading font-bold text-base mb-1">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Ready to analyze your career?
          </h2>
          <p className="mt-2 text-base text-muted-foreground">
            Connect your profiles, see where your skills stand, and get a clear plan for what to learn next.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/dashboard"
              className="inline-flex h-10 items-center rounded-md bg-primary text-sm font-medium text-primary-foreground shadow-sm shadow-primary/20 hover:bg-primary-hover transition-colors px-5"
            >
              Get Started Free
            </Link>
            <Link
              href="#features"
              className="inline-flex h-10 items-center rounded-md border border-input bg-background px-5 text-sm font-medium text-foreground hover:bg-secondary transition-colors"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-border bg-background py-6 px-4 sm:px-6 lg:px-8 mt-auto">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row justify-between items-center gap-3">
          <div className="flex items-center gap-2">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
            </svg>
            <span className="font-heading font-bold text-base">Skillforge</span>
          </div>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Next-Gen Skillforge. All rights reserved.
          </p>
          <div className="flex gap-4 text-xs">
            <a
              href="https://github.com/divyanshakya966/Next-Gen-Skillforge"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
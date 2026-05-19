import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Zap, Shield, Code2, ArrowRight, Github } from 'lucide-react';

const features = [
  {
    icon: Zap,
    title: 'Blazing Fast',
    description:
      'Built with Next.js 14 App Router, server components, and optimized for peak performance.',
  },
  {
    icon: Shield,
    title: 'Secure by Default',
    description:
      'JWT authentication, role-based access control, and bcrypt password hashing out of the box.',
  },
  {
    icon: Code2,
    title: 'Type-Safe',
    description:
      'End-to-end TypeScript with shared types across frontend and backend via workspace packages.',
  },
  {
    icon: Sparkles,
    title: 'Modern Stack',
    description:
      'Turborepo monorepo, NestJS API, Prisma ORM, PostgreSQL, and shadcn/ui components.',
  },
];

const techStack = [
  'Next.js 14',
  'NestJS 10',
  'Prisma 5',
  'PostgreSQL',
  'TypeScript 5',
  'Tailwind CSS',
  'shadcn/ui',
  'Turborepo',
];

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 max-w-screen-2xl items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <span className="font-bold text-lg">Dazzling UM</span>
          </div>
          <nav className="flex items-center gap-4">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Github className="h-4 w-4" />
              GitHub
            </a>
            <Button size="sm">Get Started</Button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="container mx-auto flex flex-col items-center justify-center gap-8 py-24 text-center md:py-32">
          <Badge variant="secondary" className="gap-1.5 px-4 py-1.5 text-sm">
            <Sparkles className="h-3.5 w-3.5" />
            Production-Ready Monorepo
          </Badge>

          <div className="max-w-3xl space-y-4">
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
              Welcome to{' '}
              <span className="gradient-text">Dazzling UM</span>
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground md:text-xl">
              A modern full-stack monorepo powered by Next.js, NestJS, Prisma, and TypeScript.
              Everything you need to build production-grade applications, fast.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button size="lg" className="gap-2">
              Get Started
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" className="gap-2">
              <Github className="h-4 w-4" />
              View on GitHub
            </Button>
          </div>

          {/* Tech Stack Badges */}
          <div className="flex flex-wrap justify-center gap-2 pt-4">
            {techStack.map((tech) => (
              <Badge key={tech} variant="outline" className="text-xs">
                {tech}
              </Badge>
            ))}
          </div>
        </section>

        {/* Features Section */}
        <section className="container mx-auto py-16">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight">Everything you need</h2>
            <p className="mt-3 text-muted-foreground">
              Built with best practices and production-ready tooling from day one.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <Card
                key={feature.title}
                className="group relative overflow-hidden transition-all hover:shadow-lg hover:-translate-y-0.5"
              >
                <CardHeader className="pb-3">
                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
                    <feature.icon className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-base">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto py-16">
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
            <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
              <Sparkles className="h-8 w-8 text-primary" />
              <h2 className="text-2xl font-bold">Ready to build something dazzling?</h2>
              <p className="max-w-md text-muted-foreground">
                Clone the repository, run <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">npm install</code> and{' '}
                <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">npm run dev</code>, and you&apos;re off.
              </p>
              <div className="flex gap-3">
                <Button className="gap-2">
                  Start Building
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button variant="outline">Read the Docs</Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto flex flex-col items-center justify-between gap-4 text-sm text-muted-foreground md:flex-row">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="font-medium">Dazzling UM</span>
          </div>
          <p>Built with Next.js, NestJS, and Prisma. Open source.</p>
        </div>
      </footer>
    </div>
  );
}

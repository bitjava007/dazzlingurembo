import Link from 'next/link';
import { Button } from '@dazzling/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@dazzling/ui/card';
import { Badge } from '@dazzling/ui/badge';

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-8">
      <div className="w-full max-w-4xl space-y-12">
        {/* Hero */}
        <div className="text-center space-y-4 animate-fade-in">
          <Badge variant="secondary" className="text-sm px-4 py-1">
            Production Ready
          </Badge>
          <h1 className="text-5xl font-bold tracking-tight text-foreground">
            Dazzling <span className="text-primary">UM</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            A modern, full-stack monorepo built with Next.js, NestJS, and PostgreSQL. Enterprise
            architecture, developer experience first.
          </p>
          <div className="flex items-center justify-center gap-4 pt-4">
            <Button asChild size="lg">
              <Link href="/dashboard">Get Started</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/login">Sign In</Link>
            </Button>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Next.js 14</CardTitle>
              <CardDescription>App Router, Server Components, TypeScript</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Modern React with streaming, suspense, and parallel routes baked in.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">NestJS API</CardTitle>
              <CardDescription>Modular, scalable backend architecture</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Enterprise-grade REST API with Swagger docs, JWT auth, and Prisma ORM.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Turborepo</CardTitle>
              <CardDescription>pnpm workspaces + incremental builds</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Shared packages, parallel task execution, and intelligent caching.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground">
          <p>
            Powered by{' '}
            <span className="font-medium text-foreground">Next.js</span>,{' '}
            <span className="font-medium text-foreground">NestJS</span>, and{' '}
            <span className="font-medium text-foreground">Turborepo</span>
          </p>
        </div>
      </div>
    </main>
  );
}

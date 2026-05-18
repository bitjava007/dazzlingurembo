import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@dazzling/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@dazzling/ui/card';
import { Input } from '@dazzling/ui/input';
import { Separator } from '@dazzling/ui/separator';

export const metadata: Metadata = {
  title: 'Sign In',
};

export default function LoginPage() {
  return (
    <Card className="shadow-lg">
      <CardHeader className="space-y-1 text-center">
        <div className="flex justify-center mb-2">
          <span className="text-3xl font-bold text-primary">DU</span>
        </div>
        <CardTitle className="text-2xl">Welcome back</CardTitle>
        <CardDescription>Sign in to your Dazzling UM account</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <form className="space-y-4" action="/api/auth/login" method="POST">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Email
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="name@example.com"
              autoComplete="email"
              required
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Password
              </label>
              <Link href="/forgot-password" className="text-sm text-primary hover:underline">
                Forgot password?
              </Link>
            </div>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              required
            />
          </div>

          <Button type="submit" className="w-full">
            Sign In
          </Button>
        </form>

        <Separator />

        <div className="text-center text-sm text-muted-foreground">
          <p>Demo credentials: <code className="text-xs bg-muted px-1 py-0.5 rounded">admin@dazzling.dev / Password1!</code></p>
        </div>
      </CardContent>

      <CardFooter className="justify-center">
        <p className="text-sm text-muted-foreground">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-primary hover:underline font-medium">
            Sign up
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}

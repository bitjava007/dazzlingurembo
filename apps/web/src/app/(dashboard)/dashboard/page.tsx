import type { Metadata } from 'next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@dazzling/ui/card';
import { Badge } from '@dazzling/ui/badge';

export const metadata: Metadata = {
  title: 'Dashboard',
};

const stats = [
  { label: 'Total Users', value: '1,234', change: '+12%', changeType: 'positive' as const },
  { label: 'Active Sessions', value: '89', change: '+3%', changeType: 'positive' as const },
  { label: 'API Requests', value: '24.5k', change: '-2%', changeType: 'negative' as const },
  { label: 'Uptime', value: '99.9%', change: '+0.1%', changeType: 'positive' as const },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back. Here&apos;s what&apos;s happening today.
          </p>
        </div>
        <Badge variant="success">System Healthy</Badge>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="pb-2">
              <CardDescription>{stat.label}</CardDescription>
              <CardTitle className="text-3xl">{stat.value}</CardTitle>
            </CardHeader>
            <CardContent>
              <p
                className={`text-xs font-medium ${
                  stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {stat.change} from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Placeholder sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest events from your workspace</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { text: 'New user registered', time: '2 minutes ago' },
                { text: 'API migration completed', time: '1 hour ago' },
                { text: 'Database backup created', time: '3 hours ago' },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b last:border-0">
                  <p className="text-sm">{item.text}</p>
                  <span className="text-xs text-muted-foreground">{item.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
            <CardDescription>Current service health</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { service: 'API Server', status: 'Operational' },
                { service: 'Database', status: 'Operational' },
                { service: 'Redis Cache', status: 'Operational' },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b last:border-0">
                  <p className="text-sm font-medium">{item.service}</p>
                  <Badge variant="success" className="text-xs">{item.status}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

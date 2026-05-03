import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Code2, Activity, Database, MessageSquare, FileUp, BellRing } from 'lucide-react';

const endpoints = [
  {
    icon: Activity,
    method: 'GET',
    path: '/health',
    description: 'Server readiness endpoint used by deployment checks and uptime monitoring.',
  },
  {
    icon: Database,
    method: 'GET',
    path: '/api/health/db',
    description: 'Database connectivity check for Prisma and the production data layer.',
  },
  {
    icon: MessageSquare,
    method: 'POST',
    path: '/api/chat',
    description: 'Send collaboration messages, room updates, and file attachment metadata.',
  },
  {
    icon: FileUp,
    method: 'POST',
    path: '/api/files/upload',
    description: 'Upload shared files and attachments for project collaboration.',
  },
  {
    icon: BellRing,
    method: 'GET',
    path: '/api/inquiries',
    description: 'Fetch marketplace and inbox inquiry data for dashboard views.',
  },
];

const ApiDocs = () => {
  return (
    <main className="min-h-screen bg-background pt-28 pb-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="space-y-4 max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">API Docs</p>
          <h1 className="text-4xl font-bold tracking-tight text-foreground">Backend endpoints powering the platform</h1>
          <p className="text-base text-muted-foreground">
            This overview highlights the main production endpoints available to the frontend and deployment checks.
          </p>
        </div>

        <div className="grid gap-4">
          {endpoints.map((endpoint) => (
            <Card key={endpoint.path} className="border-border/70 bg-card/80 shadow-sm backdrop-blur">
              <CardContent className="p-5 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <endpoint.icon className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-primary">
                      <span>{endpoint.method}</span>
                      <span className="text-muted-foreground">{endpoint.path}</span>
                    </div>
                    <p className="text-sm text-muted-foreground max-w-2xl">{endpoint.description}</p>
                  </div>
                </div>
                <Button asChild variant="outline">
                  <Link to="/support">Need help connecting?</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="border-border/70 bg-primary/5">
          <CardContent className="p-6 md:p-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2 max-w-2xl">
              <h2 className="text-xl font-semibold">Want the full schema and integration notes?</h2>
              <p className="text-sm text-muted-foreground">
                Use the deployment guide and repository documentation for environment variables, Prisma migrations, and production build steps.
              </p>
            </div>
            <Button asChild>
              <Link to="/documentation">
                Open documentation hub <Code2 className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  );
};

export default ApiDocs;

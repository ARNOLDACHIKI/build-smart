import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, FileText, ExternalLink, ShieldCheck, Sparkles, Code2 } from 'lucide-react';

const documentationItems = [
  {
    icon: FileText,
    title: 'Project Overview',
    description: 'Read the feature summary, delivery notes, and implementation history for the current release.',
    href: '/#features',
  },
  {
    icon: ShieldCheck,
    title: 'Setup & Deployment',
    description: 'Follow the production deployment guide for Vercel, Render, and environment configuration.',
    href: '/support',
  },
  {
    icon: Sparkles,
    title: 'Community UX Guide',
    description: 'Explore the Reddit-style community feed, threaded discussions, and knowledge hub workflow.',
    href: '/community/reddit',
  },
  {
    icon: Code2,
    title: 'Developer Reference',
    description: 'Review the code change summary and API behavior used by the collaboration platform.',
    href: '/api-docs',
  },
];

const Documentation = () => {
  return (
    <main className="min-h-screen bg-background pt-28 pb-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="space-y-4 max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">Documentation</p>
          <h1 className="text-4xl font-bold tracking-tight text-foreground">Everything you need to understand and use the platform</h1>
          <p className="text-base text-muted-foreground">
            This hub connects the latest product guides, deployment instructions, and developer references so the mini menus lead somewhere useful.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {documentationItems.map((item) => (
            <Card key={item.title} className="border-border/70 bg-card/80 shadow-sm backdrop-blur">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold">{item.title}</h2>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                </div>
                <Button asChild className="w-full sm:w-auto">
                  <Link to={item.href}>
                    Open <ExternalLink className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="border-border/70 bg-primary/5">
          <CardContent className="p-6 md:p-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2 max-w-2xl">
              <h2 className="text-xl font-semibold">Need the full implementation index?</h2>
              <p className="text-sm text-muted-foreground">
                The repository includes the full documentation index, deployment guide, and feature summaries for deeper review.
              </p>
            </div>
            <Button asChild variant="outline">
              <Link to="/support">
                View deployment help
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  );
};

export default Documentation;

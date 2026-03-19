import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';

const DashboardHome = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-5">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold font-['Space_Grotesk']">
              Welcome, {user?.name || user?.email?.split('@')[0] || 'Builder'}
            </h1>
            <p className="text-sm text-muted-foreground">This is the same system preview shown in the iPhone mockup.</p>
          </div>
          <Badge variant="secondary" className="gap-1"><Sparkles className="w-3 h-3" /> Mobile-first workspace</Badge>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <Card className="border border-border/70 overflow-hidden">
          <CardContent className="p-0">
            <div className="gradient-primary text-primary-foreground p-5">
              <p className="text-lg font-semibold leading-tight">Build smarter projects with AI</p>
              <p className="text-sm opacity-90 mt-1.5 max-w-2xl">Find contractors, compare plans, and manage delivery from one platform.</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button asChild size="sm" variant="secondary">
                  <Link to="/dashboard/projects">Get Started</Link>
                </Button>
                <Button asChild size="sm" variant="outline" className="border-white/40 text-primary-foreground hover:bg-white/15">
                  <Link to="/dashboard/reports">Watch Demo</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
        <Input
          className="h-10 bg-card"
          placeholder="Search projects, talent, or services..."
        />
      </motion.div>

      <div className="grid md:grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardContent className="p-4 space-y-3">
              <p className="text-sm font-semibold">Core features</p>
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-lg bg-blue-50 border border-blue-100 p-2">
                  <p className="text-xs font-semibold text-blue-700">AI Search</p>
                  <p className="text-[11px] text-blue-600/90 mt-0.5">Find vetted experts fast</p>
                </div>
                <div className="rounded-lg bg-emerald-50 border border-emerald-100 p-2">
                  <p className="text-xs font-semibold text-emerald-700">Collaboration</p>
                  <p className="text-[11px] text-emerald-700/90 mt-0.5">Team and client updates</p>
                </div>
                <div className="rounded-lg bg-amber-50 border border-amber-100 p-2">
                  <p className="text-xs font-semibold text-amber-700">Live Tracking</p>
                  <p className="text-[11px] text-amber-700/90 mt-0.5">Progress in real time</p>
                </div>
                <div className="rounded-lg bg-violet-50 border border-violet-100 p-2">
                  <p className="text-xs font-semibold text-violet-700">Role Portals</p>
                  <p className="text-[11px] text-violet-700/90 mt-0.5">Engineer, admin, client</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>
          <Card>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">Pricing plans</p>
                <Link to="/dashboard/credits" className="text-xs text-muted-foreground hover:text-primary">Compare</Link>
              </div>
              <div className="space-y-2">
                <div className="rounded-lg border border-border px-3 py-2 flex items-center justify-between">
                  <span className="text-xs font-medium">Free</span><span className="text-xs text-muted-foreground">$0</span>
                </div>
                <div className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 flex items-center justify-between">
                  <span className="text-xs font-medium text-blue-700">Standard</span><span className="text-xs text-blue-700">$30</span>
                </div>
                <div className="rounded-lg border border-violet-200 bg-violet-50 px-3 py-2 flex items-center justify-between">
                  <span className="text-xs font-medium text-violet-700">Premium</span><span className="text-xs text-violet-700">$50</span>
                </div>
                <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 flex items-center justify-between">
                  <span className="text-xs font-medium text-amber-700">Enterprise</span><span className="text-xs text-amber-700">$75</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }}>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm font-semibold">Trusted by builders</p>
              <p className="text-sm text-muted-foreground mt-1">"We reduced project delays by 38% in one quarter using Build Smart workflows."</p>
              <div className="mt-3 flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }}>
          <Card className="gradient-primary text-primary-foreground border-0">
            <CardContent className="p-4">
              <p className="text-base font-semibold">Start your next project today</p>
              <p className="text-sm opacity-90 mt-1">Join teams using the mobile-first Build Smart platform.</p>
              <Button asChild variant="secondary" size="sm" className="mt-3">
                <Link to="/dashboard/projects" className="inline-flex items-center gap-1">
                  Open Projects <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default DashboardHome;

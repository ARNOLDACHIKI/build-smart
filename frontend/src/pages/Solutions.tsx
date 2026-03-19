import { motion } from 'framer-motion';
import { Search, BarChart3, Users, Clock, AlertCircle, FileText, Zap, TrendingUp, CheckCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Link } from 'react-router-dom';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';

const Solutions = () => {
  const { t } = useLanguage();

  const solutions = [
    {
      icon: Search,
      title: 'AI-Powered Professional Search',
      description: 'Find vetted construction professionals, suppliers, and contractors faster with intelligent matching based on project requirements.',
      features: ['Smart filtering', 'Portfolio verification', 'Rating system', 'Direct messaging'],
      color: 'blue',
    },
    {
      icon: BarChart3,
      title: 'Real-Time Project Analytics',
      description: 'Track project progress, budget utilization, timeline performance, and team productivity with comprehensive dashboards.',
      features: ['Live dashboards', 'Custom reports', 'Trend analysis', 'Performance metrics'],
      color: 'emerald',
    },
    {
      icon: Users,
      title: 'Collaborative Team Management',
      description: 'Streamline communication and coordination across project teams with integrated messaging and task management.',
      features: ['Team coordination', 'Task assignment', 'Progress tracking', 'Role-based access'],
      color: 'violet',
    },
    {
      icon: AlertCircle,
      title: 'Risk Management & Early Warnings',
      description: 'Identify and mitigate project risks early with predictive alerts and comprehensive risk assessment tools.',
      features: ['Risk scoring', 'Early alerts', 'Mitigation planning', 'Compliance tracking'],
      color: 'amber',
    },
    {
      icon: FileText,
      title: 'Document Management & Compliance',
      description: 'Centralize all project documentation with version control, compliance tracking, and secure archival.',
      features: ['Version control', 'Digital signatures', 'Compliance checklists', 'Secure storage'],
      color: 'pink',
    },
    {
      icon: TrendingUp,
      title: 'Data-Driven Market Insights',
      description: 'Access construction sector trends, pricing benchmarks, and market intelligence to inform better business decisions.',
      features: ['Market trends', 'Price analysis', 'Competitor insights', 'Industry reports'],
      color: 'indigo',
    },
  ];

  const useCases = [
    {
      role: 'Project Managers',
      benefits: ['Complete project visibility', 'Automated reporting', 'Team coordination', 'Risk mitigation'],
    },
    {
      role: 'Contractors',
      benefits: ['Lead generation', 'Bid management', 'Team efficiency', 'Portfolio showcase'],
    },
    {
      role: 'Engineers',
      benefits: ['Project collaboration', 'Document management', 'Quality tracking', 'Professional network'],
    },
    {
      role: 'Suppliers',
      benefits: ['Direct market access', 'Order management', 'Performance metrics', 'Vendor rating'],
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  const getColorClasses = (color: string) => {
    const colorMap: Record<string, { bg: string; border: string; icon: string }> = {
      blue: { bg: 'bg-blue-50', border: 'border-blue-200', icon: 'text-blue-600' },
      emerald: { bg: 'bg-emerald-50', border: 'border-emerald-200', icon: 'text-emerald-600' },
      violet: { bg: 'bg-violet-50', border: 'border-violet-200', icon: 'text-violet-600' },
      amber: { bg: 'bg-amber-50', border: 'border-amber-200', icon: 'text-amber-600' },
      pink: { bg: 'bg-pink-50', border: 'border-pink-200', icon: 'text-pink-600' },
      indigo: { bg: 'bg-indigo-50', border: 'border-indigo-200', icon: 'text-indigo-600' },
    };
    return colorMap[color] || colorMap.blue;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 overflow-hidden relative">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full bg-accent/5 blur-3xl" />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="gradient-text">Construction Solutions</span>
              {' '}for Every Role
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Comprehensive tools designed specifically for the construction industry. From project managers to suppliers, Build Smart has the right solution for your needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register" className="px-8 py-3 rounded-lg gradient-primary text-primary-foreground font-semibold hover:shadow-lg transition-shadow">
                Get Started Free
              </Link>
              <a href="#use-cases" className="px-8 py-3 rounded-lg border border-primary text-primary font-semibold hover:bg-primary/5 transition-colors">
                Explore Solutions
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Solutions Grid */}
      <section id="solutions" className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            className="text-center mb-16"
          >
            <motion.h2 variants={itemVariants} className="text-4xl md:text-5xl font-bold mb-4">
              Core Solutions
            </motion.h2>
            <motion.p variants={itemVariants} className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our platform provides integrated solutions to solve the biggest challenges in construction management
            </motion.p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {solutions.map((solution, i) => {
              const Icon = solution.icon;
              const colors = getColorClasses(solution.color);
              return (
                <motion.div key={i} variants={itemVariants} className={`rounded-2xl border border-border p-8 hover:shadow-lg transition-shadow ${colors.bg}`}>
                  <div className={`w-14 h-14 rounded-lg ${colors.bg} border ${colors.border} flex items-center justify-center mb-4`}>
                    <Icon className={`w-7 h-7 ${colors.icon}`} />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{solution.title}</h3>
                  <p className="text-muted-foreground mb-6">{solution.description}</p>
                  <div className="space-y-2">
                    {solution.features.map((feature, j) => (
                      <div key={j} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                        {feature}
                      </div>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section id="use-cases" className="py-24 relative bg-slate-50/50 dark:bg-slate-900/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            className="text-center mb-16"
          >
            <motion.h2 variants={itemVariants} className="text-4xl md:text-5xl font-bold mb-4">
              Built for Your Role
            </motion.h2>
            <motion.p variants={itemVariants} className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Whether you're managing projects, executing work, or supplying materials, we have tailored solutions
            </motion.p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {useCases.map((useCase, i) => (
              <motion.div key={i} variants={itemVariants} className="rounded-xl border border-border bg-white dark:bg-slate-900 p-6 hover:shadow-xl transition-shadow">
                <h3 className="font-bold text-lg mb-4">{useCase.role}</h3>
                <ul className="space-y-3">
                  {useCase.benefits.map((benefit, j) => (
                    <li key={j} className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0 mt-2" />
                      <span className="text-sm text-muted-foreground">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-primary/10 blur-3xl" />
        </div>
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            className="text-center"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Transform Your Projects?</h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join construction teams across East Africa who are building smarter with real-time collaboration, AI-powered insights, and integrated solutions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register" className="px-8 py-3 rounded-lg gradient-primary text-primary-foreground font-semibold hover:shadow-lg transition-shadow">
                Start Free Trial
              </Link>
              <a href="#solutions" className="px-8 py-3 rounded-lg border border-primary text-primary font-semibold hover:bg-primary/5 transition-colors">
                Back to Solutions
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Solutions;

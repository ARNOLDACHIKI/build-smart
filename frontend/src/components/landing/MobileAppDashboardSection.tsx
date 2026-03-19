import { motion } from 'framer-motion';
import { CheckCircle, TrendingUp, Users, Clock, Star, MoreVertical, Bell, Settings } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const MobileAppDashboardSection = () => {
  const { t } = useLanguage();

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

  return (
    <section id="dashboard" className="py-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="text-center mb-16"
        >
          <motion.h2 variants={itemVariants} className="text-4xl md:text-5xl font-bold mb-4">
            <span className="gradient-text">App Experience</span>
          </motion.h2>
          <motion.p variants={itemVariants} className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Manage your construction projects with our intuitive mobile dashboard
          </motion.p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Mobile Phone Mockup */}
          <motion.div
            variants={itemVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            className="flex justify-center"
          >
            <div className="relative w-72 h-96 rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 p-2 shadow-2xl border border-slate-700">
              {/* Phone notch */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-7 bg-slate-900 rounded-b-2xl z-10 border-l border-r border-b border-slate-700" />

              {/* Actual content area */}
              <div className="w-full h-full rounded-2xl bg-gradient-to-b from-slate-50 to-slate-100 overflow-hidden flex flex-col">
                {/* Header */}
                <div className="bg-gradient-primary text-white px-4 pt-6 pb-4">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                        <TrendingUp className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-semibold">9:41</span>
                    </div>
                    <div className="flex gap-1">
                      <Bell className="w-4 h-4" />
                      <Settings className="w-4 h-4" />
                    </div>
                  </div>
                  <h3 className="text-sm font-bold">Active Projects</h3>
                  <p className="text-xs opacity-80">4 projects in progress</p>
                </div>

                {/* Content */}
                <div className="flex-1 px-3 py-3 overflow-y-auto space-y-3">
                  {/* Project Card 1 */}
                  <div className="bg-white rounded-lg p-3 shadow-sm border border-slate-200">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="text-xs font-bold text-slate-900">Downtown Tower</p>
                        <p className="text-xs text-slate-500">Phase 2 - Foundation</p>
                      </div>
                      <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">75%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full w-3/4 bg-gradient-primary rounded-full" />
                    </div>
                  </div>

                  {/* Stats Row */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-blue-50 rounded-lg p-2 border border-blue-200">
                      <p className="text-xs text-slate-600">Team Members</p>
                      <p className="text-sm font-bold text-slate-900">12</p>
                    </div>
                    <div className="bg-amber-50 rounded-lg p-2 border border-amber-200">
                      <p className="text-xs text-slate-600">Tasks Pending</p>
                      <p className="text-sm font-bold text-slate-900">8</p>
                    </div>
                  </div>

                  {/* Project Card 2 */}
                  <div className="bg-white rounded-lg p-3 shadow-sm border border-slate-200">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="text-xs font-bold text-slate-900">Harbor Plaza</p>
                        <p className="text-xs text-slate-500">Phase 1 - Design</p>
                      </div>
                      <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">45%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full w-5/12 bg-yellow-400 rounded-full" />
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="bg-white rounded-lg p-2 border border-slate-200">
                    <p className="text-xs font-bold text-slate-900 mb-2">Quick Actions</p>
                    <div className="grid grid-cols-3 gap-1">
                      <button className="text-center p-1.5 bg-blue-50 rounded hover:bg-blue-100 transition-colors">
                        <CheckCircle className="w-4 h-4 mx-auto text-blue-600 mb-0.5" />
                        <p className="text-xs text-slate-600">Update</p>
                      </button>
                      <button className="text-center p-1.5 bg-emerald-50 rounded hover:bg-emerald-100 transition-colors">
                        <Users className="w-4 h-4 mx-auto text-emerald-600 mb-0.5" />
                        <p className="text-xs text-slate-600">Invite</p>
                      </button>
                      <button className="text-center p-1.5 bg-purple-50 rounded hover:bg-purple-100 transition-colors">
                        <MoreVertical className="w-4 h-4 mx-auto text-purple-600 mb-0.5" />
                        <p className="text-xs text-slate-600">More</p>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="bg-slate-200 h-1 border-t border-slate-300" />
              </div>
            </div>
          </motion.div>

          {/* Features List */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            className="space-y-6"
          >
            <motion.div variants={itemVariants} className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1">Real-Time Dashboard</h3>
                <p className="text-muted-foreground">Track all your projects and tasks in one unified view with live updates</p>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                  <Users className="w-6 h-6 text-blue-500" />
                </div>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1">Team Collaboration</h3>
                <p className="text-muted-foreground">Invite team members, assign tasks, and communicate seamlessly</p>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                  <CheckCircle className="w-6 h-6 text-emerald-500" />
                </div>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1">Progress Tracking</h3>
                <p className="text-muted-foreground">Monitor project milestones, completion rates, and team performance</p>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-lg bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                  <Clock className="w-6 h-6 text-amber-500" />
                </div>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1">Smart Scheduling</h3>
                <p className="text-muted-foreground">Manage timelines, deadlines, and resource allocation efficiently</p>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="pt-6">
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center text-white font-bold text-sm border-2 border-background"
                    >
                      {String.fromCharCode(65 + i)}
                    </div>
                  ))}
                </div>
                <div>
                  <p className="font-semibold text-sm">Trusted by 5,000+ teams</p>
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default MobileAppDashboardSection;

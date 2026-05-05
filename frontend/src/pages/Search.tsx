import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search as SearchIcon, MapPin, Star, Briefcase, Filter, ArrowLeft, Mail, Phone, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useLanguage } from '@/contexts/LanguageContext';
import { Link, useSearchParams } from 'react-router-dom';
import Navbar from '@/components/landing/Navbar';
import { toast } from 'sonner';
import { apiUrl } from '@/lib/api';

const professionals = [
  { name: 'Eng. David Mwangi', role: 'Structural Engineer', location: 'Nairobi', rating: 4.9, projects: 48, skills: ['Structural Design', 'BIM', 'Seismic Analysis'], portfolio: 'Nairobi Tower, JKIA Terminal 2, Thika Road Bridge', avatar: 'DM' },
  { name: 'Arch. Grace Njeri', role: 'Architect', location: 'Nairobi', rating: 4.8, projects: 35, skills: ['Sustainable Design', 'Urban Planning', 'Interior Design'], portfolio: 'Westlands Mall, Karen Residences, Kileleshwa Towers', avatar: 'GN' },
  { name: 'Eng. Joseph Otieno', role: 'Civil Engineer', location: 'Kisumu', rating: 4.7, projects: 52, skills: ['Roads', 'Bridges', 'Water Systems'], portfolio: 'Kisumu Bypass, Lake Victoria Bridge, Bondo Water Project', avatar: 'JO' },
  { name: 'QS Mary Akinyi', role: 'Quantity Surveyor', location: 'Mombasa', rating: 4.9, projects: 41, skills: ['Cost Estimation', 'Value Engineering', 'Contract Management'], portfolio: 'Mombasa Port Expansion, Diani Resort, Malindi Highway', avatar: 'MA' },
  { name: 'Eng. Peter Kamau', role: 'Electrical Engineer', location: 'Nairobi', rating: 4.6, projects: 29, skills: ['Power Systems', 'Solar Energy', 'Smart Buildings'], portfolio: 'Two Rivers Mall, Tatu City, Konza Technopolis', avatar: 'PK' },
  { name: 'Contractor Hassan Ali', role: 'General Contractor', location: 'Mombasa', rating: 4.8, projects: 67, skills: ['Commercial Buildings', 'Residential', 'Industrial'], portfolio: 'Nyali Bridge Extension, Changamwe Industrial, Port Reitz Hospital', avatar: 'HA' },
  { name: 'Arch. Wanjiku Kinyua', role: 'Landscape Architect', location: 'Naivasha', rating: 4.7, projects: 23, skills: ['Landscape Design', 'Environmental', 'Green Buildings'], portfolio: 'Lake Naivasha Resort, Nakuru National Park Gate, Nanyuki Lodge', avatar: 'WK' },
  { name: 'Eng. Samuel Kipchoge', role: 'Mechanical Engineer', location: 'Eldoret', rating: 4.5, projects: 31, skills: ['HVAC', 'Fire Protection', 'Plumbing'], portfolio: 'Moi University Complex, Eldoret Sports Center, Uasin Gishu HQ', avatar: 'SK' },
  { name: 'Eng. Faith Wambui', role: 'Environmental Engineer', location: 'Nairobi', rating: 4.8, projects: 27, skills: ['Environmental Impact', 'Waste Management', 'Sustainability'], portfolio: 'Green Park Estate, Karura Forest Project, Nairobi River Clean-up', avatar: 'FW' },
  { name: 'Contractor John Murithi', role: 'Building Contractor', location: 'Nakuru', rating: 4.6, projects: 45, skills: ['Residential', 'Renovations', 'Project Management'], portfolio: 'Lake View Apartments, Menengai Crater Resort, Nakuru County Hospital', avatar: 'JM' },
  { name: 'Arch. Sarah Kimani', role: 'Interior Architect', location: 'Nairobi', rating: 4.9, projects: 38, skills: ['Interior Design', '3D Visualization', 'Space Planning'], portfolio: 'Sarit Center Renovation, Westgate Mall Offices, Villa Rosa Kempinski', avatar: 'SK' },
  { name: 'Eng. Daniel Omondi', role: 'Geotechnical Engineer', location: 'Kisumu', rating: 4.7, projects: 33, skills: ['Soil Testing', 'Foundation Design', 'Site Investigation'], portfolio: 'Kisumu Port Expansion, Kondele Roundabout, Lake Basin Projects', avatar: 'DO' },
  { name: 'QS Mercy Chebet', role: 'Quantity Surveyor', location: 'Eldoret', rating: 4.8, projects: 29, skills: ['Bill of Quantities', 'Procurement', 'Cost Control'], portfolio: 'Moi Teaching Hospital, Eldoret Airport, University Projects', avatar: 'MC' },
  { name: 'Eng. Robert Maina', role: 'Water Engineer', location: 'Nyeri', rating: 4.6, projects: 36, skills: ['Water Supply', 'Irrigation', 'Drainage Systems'], portfolio: 'Nyeri Water Project, Mt. Kenya Irrigation, Nanyuki Pipeline', avatar: 'RM' },
  { name: 'Contractor Alice Njoroge', role: 'Road Contractor', location: 'Thika', rating: 4.7, projects: 51, skills: ['Road Construction', 'Asphalt Paving', 'Heavy Equipment'], portfolio: 'Thika Superhighway, Ruiru Bypass, Juja Road Network', avatar: 'AN' },
  { name: 'Arch. James Mutua', role: 'Urban Planner', location: 'Mombasa', rating: 4.8, projects: 24, skills: ['Urban Design', 'Master Planning', 'GIS'], portfolio: 'Mombasa Smart City, Nyali Master Plan, Diani Beach Development', avatar: 'JM' },
];

type Professional = (typeof professionals)[number] & {
  id: string;
  email?: string;
};

const fallbackProfessionals: Professional[] = professionals.map((pro) => ({
  ...pro,
  id: 'mock-' + pro.name.replace(/\s/g, '-').toLowerCase(),
}));

const getInitials = (nameOrEmail: string) =>
  nameOrEmail
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('') || 'EN';

const Search = () => {
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();
  const isFreeMode = searchParams.get('mode') === 'free';
  const [availableProfessionals, setAvailableProfessionals] = useState<Professional[]>(fallbackProfessionals);
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [roleFilter, setRoleFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [selectedProfessional, setSelectedProfessional] = useState<Professional | null>(null);
  const [contactForm, setContactForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const isMockProfessional = (id: string) => id.startsWith('mock-');

  const handleViewProfile = (pro: Professional) => {
    setSelectedProfessional(pro);
    setProfileDialogOpen(true);
  };

  useEffect(() => {
    const queryParam = searchParams.get('q');
    if (queryParam) {
      setQuery(queryParam);
    }
  }, [searchParams]);

  useEffect(() => {
    const loadEngineers = async () => {
      try {
        const response = await fetch(apiUrl('/api/engineers'));
        if (!response.ok) return;

        const data = await response.json() as {
          engineers?: Array<{
            id: string;
            name: string | null;
            email: string;
            company: string | null;
            location: string | null;
            bio: string | null;
          }>;
        };

        if (!data.engineers || data.engineers.length === 0) return;

        const live: Professional[] = data.engineers.map((eng) => {
          const displayName = eng.name || eng.email;
          return {
            id: eng.id,
            email: eng.email,
            name: displayName,
            role: 'Engineer',
            location: eng.location || 'Kenya',
            rating: 5,
            projects: 0,
            skills: [eng.company || 'Engineering'],
            portfolio: eng.bio || 'Available for construction and engineering projects.',
            avatar: getInitials(displayName),
          };
        });

        setAvailableProfessionals(live);
      } catch {
        // fallback list remains
      }
    };

    void loadEngineers();
  }, []);

  const handleContact = (pro: Professional) => {
    if (isMockProfessional(pro.id)) {
      toast.info(t('search.demoContactNotice'));
      return;
    }

    setSelectedProfessional(pro);
    setContactDialogOpen(true);
  };

  const handleSendMessage = async () => {
    if (!contactForm.name || !contactForm.email || !contactForm.message) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!selectedProfessional) {
      toast.error('No professional selected');
      return;
    }

    try {
      const response = await fetch(apiUrl('/api/inquiries'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientId: selectedProfessional.id,
          senderName: contactForm.name,
          senderEmail: contactForm.email,
          senderPhone: contactForm.phone || null,
          message: contactForm.message,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.error || 'Failed to send message');
        return;
      }

      toast.success(`Message sent to ${selectedProfessional.name}!`);
      setContactDialogOpen(false);
      setContactForm({ name: '', email: '', phone: '', message: '' });
    } catch (error) {
      console.error('Send message error:', error);
      toast.error('Failed to send message. Please try again.');
    }
  };

  const filtered = availableProfessionals.filter(p => {
    const matchesQuery = !query || p.name.toLowerCase().includes(query.toLowerCase()) || p.role.toLowerCase().includes(query.toLowerCase()) || p.skills.some(s => s.toLowerCase().includes(query.toLowerCase()));
    const matchesRole = roleFilter === 'all' || p.role.toLowerCase().includes(roleFilter.toLowerCase());
    const matchesLocation = locationFilter === 'all' || p.location.toLowerCase() === locationFilter.toLowerCase();
    return matchesQuery && matchesRole && matchesLocation;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary mb-6">
          <ArrowLeft className="w-4 h-4" /> {t('common.back')}
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl font-bold font-['Space_Grotesk'] mb-3">Who do you need for your project?</h1>
          <p className="text-muted-foreground mb-8 text-lg">Search by name, skills, specialization, location, or project type. The system will find the right match for you.</p>
        </motion.div>

        {isFreeMode ? (
          <div className="mb-6 rounded-xl border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-foreground">
            <p>{t('search.freeModeBanner')}</p>
            <Link to="/login" className="mt-2 inline-flex text-sm font-medium text-primary hover:underline">
              Go to Login
            </Link>
          </div>
        ) : null}

        {/* Open-ended search bar */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} 
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <div className="card-3d p-4 flex gap-3">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input 
                placeholder={t('hero.searchPlaceholder')} 
                className="pl-10 h-14 border-0 bg-transparent text-base" 
                value={query} 
                onChange={(e) => setQuery(e.target.value)} 
                autoFocus
              />
            </div>
            <Button 
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              variant="outline"
              className="h-14 px-4"
            >
              <Filter className="w-4 h-4 mr-2" />
              {showAdvancedFilters ? 'Hide' : 'Filters'}
            </Button>
          </div>
          
          {/* Optional advanced filters */}
          {showAdvancedFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 p-4 card-3d flex flex-wrap gap-4"
            >
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Filter by Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="engineer">Engineers</SelectItem>
                  <SelectItem value="architect">Architects</SelectItem>
                  <SelectItem value="contractor">Contractors</SelectItem>
                  <SelectItem value="surveyor">Quantity Surveyors</SelectItem>
                </SelectContent>
              </Select>
              <Select value={locationFilter} onValueChange={setLocationFilter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Filter by Location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  <SelectItem value="nairobi">Nairobi</SelectItem>
                  <SelectItem value="mombasa">Mombasa</SelectItem>
                  <SelectItem value="kisumu">Kisumu</SelectItem>
                  <SelectItem value="eldoret">Eldoret</SelectItem>
                  <SelectItem value="naivasha">Naivasha</SelectItem>
                </SelectContent>
              </Select>
            </motion.div>
          )}
        </motion.div>

        <p className="text-sm text-muted-foreground mb-4">{filtered.length} {t('search.results')}</p>

        {/* Results */}
        <div className="grid md:grid-cols-2 gap-6">
          {filtered.map((pro, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="card-3d border-0">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-xl gradient-primary flex items-center justify-center text-primary-foreground text-lg font-bold flex-shrink-0">{pro.avatar}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold font-['Space_Grotesk'] truncate">{pro.name}</h3>
                        <div className="flex items-center gap-1 text-sm">
                          <Star className="w-4 h-4 fill-primary text-primary" />
                          <span className="font-medium">{pro.rating}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                        <Badge variant="secondary">{pro.role}</Badge>
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{pro.location}</span>
                        <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" />{pro.projects} projects</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {pro.skills.map((skill, j) => (
                          <Badge key={j} variant="outline" className="text-xs">{skill}</Badge>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground mb-4"><span className="font-medium text-foreground">Portfolio: </span>{pro.portfolio}</p>
                      <div className="flex gap-2">
                        <Button size="sm" className="gradient-primary text-primary-foreground" onClick={() => handleViewProfile(pro)}>{t('search.viewProfile')}</Button>
                        <Button size="sm" variant="outline" onClick={() => handleContact(pro)}>{t('search.contact')}</Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Contact Dialog */}
      <Dialog open={profileDialogOpen} onOpenChange={setProfileDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Professional Profile</DialogTitle>
            <DialogDescription>
              Profile overview and project highlights.
            </DialogDescription>
          </DialogHeader>
          {selectedProfessional ? (
            <div className="space-y-4 py-2">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center text-primary-foreground font-bold">
                  {selectedProfessional.avatar}
                </div>
                <div>
                  <p className="font-semibold">{selectedProfessional.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedProfessional.role} • {selectedProfessional.location}</p>
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Skills</p>
                <div className="flex flex-wrap gap-1.5">
                  {selectedProfessional.skills.map((skill, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">{skill}</Badge>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Portfolio</p>
                <p className="text-sm text-muted-foreground">{selectedProfessional.portfolio}</p>
              </div>
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setProfileDialogOpen(false);
                    handleContact(selectedProfessional);
                  }}
                >
                  {t('search.contact')}
                </Button>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog open={contactDialogOpen} onOpenChange={setContactDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Contact {selectedProfessional?.name}</DialogTitle>
            <DialogDescription>
              Send a message to connect with this professional
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <div className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center text-primary-foreground font-bold">
                {selectedProfessional?.avatar}
              </div>
              <div>
                <p className="font-semibold">{selectedProfessional?.name}</p>
                <p className="text-sm text-muted-foreground">{selectedProfessional?.role}</p>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact-name">Your Name *</Label>
              <Input 
                id="contact-name" 
                placeholder="John Doe" 
                value={contactForm.name}
                onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact-email">Your Email *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  id="contact-email" 
                  type="email" 
                  placeholder="john@example.com" 
                  className="pl-9"
                  value={contactForm.email}
                  onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact-phone">Your Phone</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  id="contact-phone" 
                  type="tel" 
                  placeholder="+254 712 345 678" 
                  className="pl-9"
                  value={contactForm.phone}
                  onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact-message">Message *</Label>
              <Textarea 
                id="contact-message" 
                placeholder="Hi, I'm interested in your services for..." 
                rows={4}
                value={contactForm.message}
                onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
              />
            </div>
            <Button 
              className="w-full gradient-primary text-primary-foreground" 
              onClick={handleSendMessage}
            >
              <Send className="w-4 h-4 mr-2" /> Send Message
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Search;

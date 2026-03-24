import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search as SearchIcon, MapPin, Star, Briefcase, Filter, Mail, Phone, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';
import { apiUrl } from '@/lib/api';
import { authStorage } from '@/lib/auth';

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

const ProfessionalSearch = () => {
  const { t } = useLanguage();
  const [availableProfessionals, setAvailableProfessionals] = useState<Professional[]>(fallbackProfessionals);
  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [selectedProfessional, setSelectedProfessional] = useState<Professional | null>(null);
  const [contactForm, setContactForm] = useState({ name: '', email: '', phone: '', message: '' });

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
    setSelectedProfessional(pro);
    setContactDialogOpen(true);
  };

  const handleViewProfile = (pro: Professional) => {
    setSelectedProfessional(pro);
    setProfileDialogOpen(true);
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
      const token = authStorage.getToken();
      const response = await fetch(apiUrl('/api/inquiries'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
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
    <div className="space-y-6">
      <h1 className="text-2xl font-bold font-['Space_Grotesk']">{t('search.title')}</h1>

      <div className="card-3d p-4 flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder={t('hero.searchPlaceholder')} className="pl-9 border-0 bg-transparent" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-[160px]"><Filter className="w-4 h-4 mr-1" /><SelectValue placeholder="Role" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="engineer">Engineers</SelectItem>
            <SelectItem value="architect">Architects</SelectItem>
            <SelectItem value="contractor">Contractors</SelectItem>
            <SelectItem value="surveyor">Quantity Surveyors</SelectItem>
          </SelectContent>
        </Select>
        <Select value={locationFilter} onValueChange={setLocationFilter}>
          <SelectTrigger className="w-[160px]"><MapPin className="w-4 h-4 mr-1" /><SelectValue placeholder="Location" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Kenya</SelectItem>
            <SelectItem value="nairobi">Nairobi</SelectItem>
            <SelectItem value="mombasa">Mombasa</SelectItem>
            <SelectItem value="kisumu">Kisumu</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <p className="text-sm text-muted-foreground">{filtered.length} {t('search.results')}</p>

      <div className="grid md:grid-cols-2 gap-6">
        {filtered.map((pro, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="card-3d border-0">
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center text-primary-foreground font-bold flex-shrink-0">{pro.avatar}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold font-['Space_Grotesk'] text-sm">{pro.name}</h3>
                      <div className="flex items-center gap-1 text-xs"><Star className="w-3.5 h-3.5 fill-primary text-primary" />{pro.rating}</div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                      <Badge variant="secondary" className="text-[10px]">{pro.role}</Badge>
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{pro.location}</span>
                      <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" />{pro.projects}</span>
                    </div>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {pro.skills.map((s, j) => <Badge key={j} variant="outline" className="text-[10px]">{s}</Badge>)}
                    </div>
                    <p className="text-xs text-muted-foreground"><span className="font-medium text-foreground">Portfolio: </span>{pro.portfolio}</p>
                    <div className="flex gap-2 mt-3">
                      <Button size="sm" className="gradient-primary text-primary-foreground text-xs" onClick={() => handleViewProfile(pro)}>{t('search.viewProfile')}</Button>
                      <Button size="sm" variant="outline" className="text-xs" onClick={() => handleContact(pro)}>{t('search.contact')}</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Dialog open={profileDialogOpen} onOpenChange={setProfileDialogOpen}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>{selectedProfessional?.name}</DialogTitle>
            <DialogDescription>
              Professional profile overview
            </DialogDescription>
          </DialogHeader>
          {selectedProfessional && (
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center text-primary-foreground font-bold">
                  {selectedProfessional.avatar}
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold">{selectedProfessional.role}</p>
                  <p className="text-xs text-muted-foreground">{selectedProfessional.location}</p>
                  <p className="text-xs text-muted-foreground">{selectedProfessional.projects} completed projects</p>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-1">Core skills</p>
                <div className="flex flex-wrap gap-1.5">
                  {selectedProfessional.skills.map((skill) => (
                    <Badge key={skill} variant="secondary" className="text-[11px]">{skill}</Badge>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-1">Portfolio</p>
                <p className="text-sm">{selectedProfessional.portfolio}</p>
              </div>

              <Button
                className="w-full gradient-primary text-primary-foreground"
                onClick={() => {
                  setProfileDialogOpen(false);
                  setContactDialogOpen(true);
                }}
              >
                Contact {selectedProfessional.name.split(' ')[0]}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Contact Dialog */}
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

export default ProfessionalSearch;

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search as SearchIcon, MapPin, Star, Briefcase, Filter, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/contexts/LanguageContext';
import { Link } from 'react-router-dom';
import Navbar from '@/components/landing/Navbar';

const professionals = [
  { name: 'Eng. David Mwangi', role: 'Structural Engineer', location: 'Nairobi', rating: 4.9, projects: 48, skills: ['Structural Design', 'BIM', 'Seismic Analysis'], portfolio: 'Nairobi Tower, JKIA Terminal 2, Thika Road Bridge', avatar: 'DM' },
  { name: 'Arch. Grace Njeri', role: 'Architect', location: 'Nairobi', rating: 4.8, projects: 35, skills: ['Sustainable Design', 'Urban Planning', 'Interior Design'], portfolio: 'Westlands Mall, Karen Residences, Kileleshwa Towers', avatar: 'GN' },
  { name: 'Eng. Joseph Otieno', role: 'Civil Engineer', location: 'Kisumu', rating: 4.7, projects: 52, skills: ['Roads', 'Bridges', 'Water Systems'], portfolio: 'Kisumu Bypass, Lake Victoria Bridge, Bondo Water Project', avatar: 'JO' },
  { name: 'QS Mary Akinyi', role: 'Quantity Surveyor', location: 'Mombasa', rating: 4.9, projects: 41, skills: ['Cost Estimation', 'Value Engineering', 'Contract Management'], portfolio: 'Mombasa Port Expansion, Diani Resort, Malindi Highway', avatar: 'MA' },
  { name: 'Eng. Peter Kamau', role: 'Electrical Engineer', location: 'Nairobi', rating: 4.6, projects: 29, skills: ['Power Systems', 'Solar Energy', 'Smart Buildings'], portfolio: 'Two Rivers Mall, Tatu City, Konza Technopolis', avatar: 'PK' },
  { name: 'Contractor Hassan Ali', role: 'General Contractor', location: 'Mombasa', rating: 4.8, projects: 67, skills: ['Commercial Buildings', 'Residential', 'Industrial'], portfolio: 'Nyali Bridge Extension, Changamwe Industrial, Port Reitz Hospital', avatar: 'HA' },
  { name: 'Arch. Wanjiku Kinyua', role: 'Landscape Architect', location: 'Naivasha', rating: 4.7, projects: 23, skills: ['Landscape Design', 'Environmental', 'Green Buildings'], portfolio: 'Lake Naivasha Resort, Nakuru National Park Gate, Nanyuki Lodge', avatar: 'WK' },
  { name: 'Eng. Samuel Kipchoge', role: 'Mechanical Engineer', location: 'Eldoret', rating: 4.5, projects: 31, skills: ['HVAC', 'Fire Protection', 'Plumbing'], portfolio: 'Moi University Complex, Eldoret Sports Center, Uasin Gishu HQ', avatar: 'SK' },
];

const Search = () => {
  const { t } = useLanguage();
  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');

  const filtered = professionals.filter(p => {
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
          <h1 className="text-3xl font-bold font-['Space_Grotesk'] mb-2">{t('search.title')}</h1>
          <p className="text-muted-foreground mb-8">{t('search.subtitle')}</p>
        </motion.div>

        {/* Filters */}
        <div className="card-3d p-4 mb-8 flex flex-wrap gap-4">
          <div className="relative flex-1 min-w-[200px]">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder={t('hero.searchPlaceholder')} className="pl-9 border-0 bg-transparent" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-[180px]"><Filter className="w-4 h-4 mr-1" /><SelectValue placeholder="Role" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="engineer">Engineers</SelectItem>
              <SelectItem value="architect">Architects</SelectItem>
              <SelectItem value="contractor">Contractors</SelectItem>
              <SelectItem value="surveyor">Quantity Surveyors</SelectItem>
            </SelectContent>
          </Select>
          <Select value={locationFilter} onValueChange={setLocationFilter}>
            <SelectTrigger className="w-[180px]"><MapPin className="w-4 h-4 mr-1" /><SelectValue placeholder="Location" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              <SelectItem value="nairobi">Nairobi</SelectItem>
              <SelectItem value="mombasa">Mombasa</SelectItem>
              <SelectItem value="kisumu">Kisumu</SelectItem>
              <SelectItem value="eldoret">Eldoret</SelectItem>
              <SelectItem value="naivasha">Naivasha</SelectItem>
            </SelectContent>
          </Select>
        </div>

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
                        <Button size="sm" className="gradient-primary text-primary-foreground">{t('search.viewProfile')}</Button>
                        <Button size="sm" variant="outline">{t('search.contact')}</Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Search;

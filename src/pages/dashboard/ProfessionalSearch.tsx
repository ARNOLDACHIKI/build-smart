import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search as SearchIcon, MapPin, Star, Briefcase, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/contexts/LanguageContext';

const professionals = [
  { name: 'Eng. David Mwangi', role: 'Structural Engineer', location: 'Nairobi', rating: 4.9, projects: 48, skills: ['Structural Design', 'BIM', 'Seismic Analysis'], portfolio: 'Nairobi Tower, JKIA Terminal 2, Thika Road Bridge', avatar: 'DM' },
  { name: 'Arch. Grace Njeri', role: 'Architect', location: 'Nairobi', rating: 4.8, projects: 35, skills: ['Sustainable Design', 'Urban Planning', 'Interior Design'], portfolio: 'Westlands Mall, Karen Residences, Kileleshwa Towers', avatar: 'GN' },
  { name: 'Eng. Joseph Otieno', role: 'Civil Engineer', location: 'Kisumu', rating: 4.7, projects: 52, skills: ['Roads', 'Bridges', 'Water Systems'], portfolio: 'Kisumu Bypass, Lake Victoria Bridge, Bondo Water Project', avatar: 'JO' },
  { name: 'QS Mary Akinyi', role: 'Quantity Surveyor', location: 'Mombasa', rating: 4.9, projects: 41, skills: ['Cost Estimation', 'Value Engineering', 'Contract Management'], portfolio: 'Mombasa Port Expansion, Diani Resort, Malindi Highway', avatar: 'MA' },
  { name: 'Eng. Peter Kamau', role: 'Electrical Engineer', location: 'Nairobi', rating: 4.6, projects: 29, skills: ['Power Systems', 'Solar Energy', 'Smart Buildings'], portfolio: 'Two Rivers Mall, Tatu City, Konza Technopolis', avatar: 'PK' },
  { name: 'Contractor Hassan Ali', role: 'General Contractor', location: 'Mombasa', rating: 4.8, projects: 67, skills: ['Commercial Buildings', 'Residential', 'Industrial'], portfolio: 'Nyali Bridge Extension, Changamwe Industrial, Port Reitz Hospital', avatar: 'HA' },
];

const ProfessionalSearch = () => {
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
                      <Button size="sm" className="gradient-primary text-primary-foreground text-xs">{t('search.viewProfile')}</Button>
                      <Button size="sm" variant="outline" className="text-xs">{t('search.contact')}</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ProfessionalSearch;

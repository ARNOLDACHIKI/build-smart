import { useState } from 'react';
import { Plus, Search, Filter, MoreHorizontal, Edit, Trash2, Copy, Archive } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useLanguage } from '@/contexts/LanguageContext';
import { Link } from 'react-router-dom';

const projects = [
  { id: 1, name: 'Nairobi Tower Complex', status: 'active', budget: 'KES 120M', spent: 'KES 87M', deadline: '2026-08-15', progress: 72 },
  { id: 2, name: 'Mombasa Road Expansion', status: 'at-risk', budget: 'KES 85M', spent: 'KES 78M', deadline: '2026-06-30', progress: 88 },
  { id: 3, name: 'Kisumu Lakefront Bridge', status: 'active', budget: 'KES 200M', spent: 'KES 95M', deadline: '2027-01-20', progress: 45 },
  { id: 4, name: 'Thika Highway Overpass', status: 'completed', budget: 'KES 65M', spent: 'KES 62M', deadline: '2026-02-01', progress: 100 },
  { id: 5, name: 'Nakuru Residential Complex', status: 'planning', budget: 'KES 150M', spent: 'KES 5M', deadline: '2027-06-30', progress: 8 },
  { id: 6, name: 'Eldoret Industrial Park', status: 'active', budget: 'KES 300M', spent: 'KES 120M', deadline: '2027-12-15', progress: 35 },
];

const statusColors: Record<string, string> = {
  active: 'bg-primary/10 text-primary',
  'at-risk': 'bg-destructive/10 text-destructive',
  completed: 'bg-muted text-muted-foreground',
  planning: 'bg-accent/10 text-accent',
};

const Projects = () => {
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold font-['Space_Grotesk']">{t('projects.title')}</h1>
        <Button size="sm" className="gradient-primary text-primary-foreground"><Plus className="w-4 h-4 mr-1" /> {t('projects.newProject')}</Button>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder={t('common.search')} className="pl-9" />
        </div>
        <Button variant="outline" size="sm"><Filter className="w-4 h-4 mr-1" /> {t('common.filter')}</Button>
      </div>

      <Card className="glass-card border-0">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project Name</TableHead>
                <TableHead>{t('projects.status')}</TableHead>
                <TableHead>{t('projects.budget')}</TableHead>
                <TableHead>{t('projects.deadline')}</TableHead>
                <TableHead>{t('projects.progress')}</TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.map((p) => (
                <TableRow key={p.id} className="cursor-pointer hover:bg-muted/30">
                  <TableCell>
                    <Link to={`/dashboard/projects/${p.id}`} className="font-medium hover:text-primary transition-colors">
                      {p.name}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={statusColors[p.status]}>{p.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{p.budget}</div>
                    <div className="text-xs text-muted-foreground">Spent: {p.spent}</div>
                  </TableCell>
                  <TableCell className="text-sm">{p.deadline}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress value={p.progress} className="h-2 w-20" />
                      <span className="text-xs font-medium">{p.progress}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="w-4 h-4" /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem><Edit className="w-4 h-4 mr-2" /> {t('common.edit')}</DropdownMenuItem>
                        <DropdownMenuItem><Copy className="w-4 h-4 mr-2" /> Duplicate</DropdownMenuItem>
                        <DropdownMenuItem><Archive className="w-4 h-4 mr-2" /> Archive</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive"><Trash2 className="w-4 h-4 mr-2" /> {t('common.delete')}</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Projects;

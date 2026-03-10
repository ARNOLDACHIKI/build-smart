import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { BriefcaseBusiness, Plus, Search, Star } from 'lucide-react';

type PortfolioItem = {
  id: string;
  title: string;
  type: 'Commercial' | 'Infrastructure' | 'Residential';
  year: number;
  impact: string;
  featured: boolean;
};

const items: PortfolioItem[] = [
  { id: '1', title: 'CBD Seismic Retrofit', type: 'Commercial', year: 2025, impact: '40% structural safety improvement', featured: true },
  { id: '2', title: 'County Drainage Masterplan', type: 'Infrastructure', year: 2024, impact: 'Reduced flooding in 3 zones', featured: true },
  { id: '3', title: 'Green Estate Housing Blocks', type: 'Residential', year: 2023, impact: '120 modern units delivered', featured: false },
];

const EngineerPortfolio = () => {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return items.filter((i) => i.title.toLowerCase().includes(q) || i.type.toLowerCase().includes(q));
  }, [search]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Portfolio</h1>
          <p className="text-muted-foreground">Showcase your past and ongoing engineering work.</p>
        </div>
        <Button className="w-full md:w-auto"><Plus className="mr-2 h-4 w-4" />Add Portfolio Item</Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input className="pl-9" placeholder="Search portfolio" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {filtered.map((item) => (
          <Card key={item.id}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-lg">{item.title}</CardTitle>
                {item.featured && <Badge><Star className="mr-1 h-3 w-3" />Featured</Badge>}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <BriefcaseBusiness className="h-4 w-4" /> {item.type} • {item.year}
              </div>
              <p className="text-sm">{item.impact}</p>
              <div className="flex gap-2">
                <Button size="sm">Edit</Button>
                <Button size="sm" variant="outline">Preview</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default EngineerPortfolio;

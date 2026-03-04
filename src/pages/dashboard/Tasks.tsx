import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { Plus, GripVertical, Calendar, User } from 'lucide-react';

interface Task {
  id: number;
  title: string;
  project: string;
  assignee: string;
  priority: 'high' | 'medium' | 'low';
  dueDate: string;
  status: 'todo' | 'in-progress' | 'completed';
}

const initialTasks: Task[] = [
  { id: 1, title: 'Review structural drawings', project: 'Nairobi Tower', assignee: 'John K.', priority: 'high', dueDate: 'Mar 10', status: 'todo' },
  { id: 2, title: 'Order steel reinforcement', project: 'Kisumu Bridge', assignee: 'Amina H.', priority: 'high', dueDate: 'Mar 8', status: 'todo' },
  { id: 3, title: 'Submit compliance report', project: 'Mombasa Road', assignee: 'Peter O.', priority: 'medium', dueDate: 'Mar 12', status: 'todo' },
  { id: 4, title: 'Site inspection - Phase 3', project: 'Nairobi Tower', assignee: 'John K.', priority: 'medium', dueDate: 'Mar 7', status: 'in-progress' },
  { id: 5, title: 'Update project schedule', project: 'Eldoret Park', assignee: 'Sarah M.', priority: 'low', dueDate: 'Mar 15', status: 'in-progress' },
  { id: 6, title: 'Foundation inspection', project: 'Thika Highway', assignee: 'Peter O.', priority: 'high', dueDate: 'Mar 1', status: 'completed' },
  { id: 7, title: 'Budget reconciliation Q1', project: 'All Projects', assignee: 'Finance', priority: 'medium', dueDate: 'Mar 3', status: 'completed' },
];

const columns = [
  { key: 'todo' as const, label: 'To Do', color: 'bg-muted-foreground' },
  { key: 'in-progress' as const, label: 'In Progress', color: 'bg-accent' },
  { key: 'completed' as const, label: 'Completed', color: 'bg-primary' },
];

const priorityColors = { high: 'bg-destructive/10 text-destructive', medium: 'bg-accent/10 text-accent', low: 'bg-muted text-muted-foreground' };

const Tasks = () => {
  const { t } = useLanguage();
  const [tasks] = useState(initialTasks);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold font-['Space_Grotesk']">{t('sidebar.tasks')}</h1>
        <Button size="sm" className="gradient-primary text-primary-foreground"><Plus className="w-4 h-4 mr-1" /> Add Task</Button>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {columns.map((col) => (
          <div key={col.key}>
            <div className="flex items-center gap-2 mb-3">
              <div className={`w-2.5 h-2.5 rounded-full ${col.color}`} />
              <h3 className="font-semibold text-sm">{col.label}</h3>
              <Badge variant="secondary" className="ml-auto text-xs">{tasks.filter(t => t.status === col.key).length}</Badge>
            </div>
            <div className="space-y-3">
              {tasks.filter(t => t.status === col.key).map((task) => (
                <Card key={task.id} className="glass-card border-0 cursor-pointer hover:ring-1 hover:ring-primary/30 transition-all">
                  <CardContent className="p-3">
                    <div className="flex items-start gap-2">
                      <GripVertical className="w-4 h-4 text-muted-foreground/50 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium mb-1">{task.title}</div>
                        <div className="text-xs text-muted-foreground mb-2">{task.project}</div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="secondary" className={`text-[10px] ${priorityColors[task.priority]}`}>{task.priority}</Badge>
                          <span className="text-[10px] text-muted-foreground flex items-center gap-1"><Calendar className="w-3 h-3" />{task.dueDate}</span>
                          <span className="text-[10px] text-muted-foreground flex items-center gap-1"><User className="w-3 h-3" />{task.assignee}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Tasks;

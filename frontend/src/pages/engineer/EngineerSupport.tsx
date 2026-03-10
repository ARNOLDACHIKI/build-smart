import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { LifeBuoy, Mail, PhoneCall } from 'lucide-react';
import { toast } from 'sonner';

const EngineerSupport = () => {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const submit = () => {
    if (!subject.trim() || !message.trim()) {
      toast.error('Please add subject and message.');
      return;
    }

    toast.success('Support ticket submitted successfully.');
    setSubject('');
    setMessage('');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Support</h1>
        <p className="text-muted-foreground">Get help with portal access, inquiries, and project tools.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <LifeBuoy className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">Help Center</p>
                <p className="text-sm text-muted-foreground">Guides and FAQs</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">Email</p>
                <p className="text-sm text-muted-foreground">support@buildbuddy.ai</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <PhoneCall className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">Hotline</p>
                <p className="text-sm text-muted-foreground">+254 700 000 111</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Submit a Ticket</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 max-w-2xl">
          <div className="space-y-2">
            <Label htmlFor="support-subject">Subject</Label>
            <Input id="support-subject" placeholder="Issue summary" value={subject} onChange={(e) => setSubject(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="support-message">Message</Label>
            <Textarea id="support-message" rows={5} placeholder="Describe your issue" value={message} onChange={(e) => setMessage(e.target.value)} />
          </div>
          <Button onClick={submit}>Submit Ticket</Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default EngineerSupport;

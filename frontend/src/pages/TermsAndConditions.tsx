import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const sections = [
  {
    title: 'Eligibility',
    body: 'Accessible via authentic email with a cluster easily identified in the app.',
  },
  {
    title: 'Account Security',
    body: 'Users are responsible for maintaining privacy of their login details.',
  },
  {
    title: 'Data Use and Privacy',
    body: 'Data collected is used for identification purposes and ease of service provision.',
  },
  {
    title: 'Usage Restrictions',
    body:
      'Prohibited usage includes malicious content, defamatory statements, unbecoming language, illegal distribution, or any violation of intellectual property rights.',
  },
  {
    title: 'Legal Jurisdiction',
    body: 'These terms are governed by Kenyan laws.',
  },
  {
    title: 'Limitation of Liability',
    body:
      'ICDBO excludes liability arising from data loss from app usage, unauthorized access, or cybersecurity related attacks resulting from network issues.',
  },
  {
    title: 'Termination',
    body:
      'ICDBO reserves the right to terminate user access for breach of these terms, including posting malicious links capable of cybersecurity attacks.',
  },
];

const TermsAndConditions = () => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-background py-10">
      <div className="mx-auto w-full max-w-4xl px-4 sm:px-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-['Space_Grotesk'] text-3xl font-bold">Terms and Conditions</h1>
            <p className="mt-1 text-sm text-muted-foreground">Effective date: March 24, 2026</p>
            <p className="text-sm text-muted-foreground">Last updated: March 24, 2026</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handlePrint}>Print</Button>
            <Button asChild variant="outline">
              <Link to="/register">Back to Registration</Link>
            </Button>
          </div>
        </div>

        <Card className="border border-border/70">
          <CardHeader>
            <CardTitle className="text-base">ICDBO Platform Terms</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {sections.map((section) => (
              <section key={section.title} className="space-y-1.5">
                <h2 className="font-semibold">{section.title}</h2>
                <p className="text-sm leading-relaxed text-muted-foreground">{section.body}</p>
              </section>
            ))}
            <section className="rounded-lg border border-border/60 bg-muted/30 p-3">
              <p className="text-xs text-muted-foreground">
                For policy questions, contact ICDBO support. Continued use of the platform indicates acceptance of these terms.
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TermsAndConditions;

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import type { MarketplaceInquiry } from '@/lib/marketplace';

type InquiryCardProps = {
  inquiry: MarketplaceInquiry;
  actionLabel?: string;
  actionHref?: string;
  onAction?: (inquiry: MarketplaceInquiry) => void;
  matchLabel?: string;
};

const InquiryCard = ({ inquiry, actionLabel = 'View Professionals', actionHref, onAction, matchLabel = 'Matched' }: InquiryCardProps) => {
  const matchedProfessional = inquiry.matchedProfessional || inquiry.matches?.find((item) => item.status === 'ACCEPTED')?.professional || null;

  return (
    <Card className="border-border/70 bg-background/80 shadow-sm">
      <CardContent className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold">{inquiry.title || 'Construction request'}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{inquiry.description || inquiry.message}</p>
          </div>
          <Badge variant={inquiry.marketplaceStatus === 'MATCHED' ? 'default' : 'secondary'}>
            {inquiry.marketplaceStatus.toLowerCase()}
          </Badge>
        </div>

        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          {inquiry.budget && <Badge variant="outline">{inquiry.budget}</Badge>}
          {inquiry.location && <Badge variant="outline">{inquiry.location}</Badge>}
          {inquiry.category && <Badge variant="outline">{inquiry.category}</Badge>}
        </div>

        {matchedProfessional && (
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-sm">
            <p className="font-medium text-primary">{matchLabel}: {matchedProfessional.name || matchedProfessional.email}</p>
            <p className="text-muted-foreground">{matchedProfessional.role}{matchedProfessional.company ? ` • ${matchedProfessional.company}` : ''}</p>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {actionHref ? (
            <Button asChild size="sm" className="gradient-primary text-primary-foreground">
              <Link to={actionHref}>{actionLabel}</Link>
            </Button>
          ) : (
            <Button size="sm" className="gradient-primary text-primary-foreground" onClick={() => onAction?.(inquiry)}>
              {actionLabel}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default InquiryCard;
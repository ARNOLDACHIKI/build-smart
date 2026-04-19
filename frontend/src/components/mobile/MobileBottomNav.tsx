import { BadgeCheck, Compass, Home, Search, SendHorizontal, UserSquare2, WalletCards, X } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

type MobileBottomNavProps = {
  homePath: string;
  homeActivePrefixes?: string[];
  searchPath: string;
  yourSpacePath: string;
  confirmRequestPath?: string;
};

const MobileBottomNav = ({
  homePath,
  homeActivePrefixes = [],
  searchPath,
  yourSpacePath,
  confirmRequestPath,
}: MobileBottomNavProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [exploreOpen, setExploreOpen] = useState(false);

  useEffect(() => {
    setExploreOpen(false);
  }, [location.pathname, location.hash]);

  const resolvedConfirmPath = useMemo(
    () => confirmRequestPath || yourSpacePath,
    [confirmRequestPath, yourSpacePath],
  );

  const tabs = [
    {
      label: 'Home',
      to: homePath,
      icon: Home,
      active:
        location.pathname === homePath ||
        homeActivePrefixes.some((prefix) => location.pathname.startsWith(prefix)),
    },
    {
      label: 'Search',
      to: searchPath,
      icon: Search,
      active: location.pathname === searchPath || location.pathname.startsWith(`${searchPath}/`),
    },
    {
      label: 'Explore',
      to: '/solutions',
      icon: Compass,
      active: location.pathname === '/solutions' || location.pathname.startsWith('/solutions/'),
    },
    {
      label: 'Plans',
      to: '/#pricing',
      icon: WalletCards,
      active: location.pathname === '/' && location.hash === '#pricing',
    },
    {
      label: 'Your Space',
      to: yourSpacePath,
      icon: UserSquare2,
      active: location.pathname === yourSpacePath || location.pathname.startsWith(`${yourSpacePath}/`),
    },
  ];

  return (
    <>
      {exploreOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/30"
            onClick={() => setExploreOpen(false)}
            aria-label="Close explore options"
          />
          <div className="absolute inset-x-3 bottom-[calc(4.75rem+env(safe-area-inset-bottom))] rounded-2xl border border-border/70 bg-card p-3 shadow-lg">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs font-semibold text-foreground">Explore</p>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="tap-feedback focus-ring h-7 w-7"
                onClick={() => setExploreOpen(false)}
                aria-label="Close explore options"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="grid grid-cols-1 gap-2">
              <Button
                type="button"
                variant="outline"
                className="tap-feedback focus-ring h-auto justify-start whitespace-normal py-2 text-left"
                onClick={() => navigate('/solutions')}
              >
                <Compass className="mr-2 h-4 w-4" /> Explore
              </Button>
              <Button
                type="button"
                variant="outline"
                className="tap-feedback focus-ring h-auto justify-start whitespace-normal py-2 text-left"
                onClick={() => navigate(`${searchPath}?intent=initiate-request`)}
              >
                <SendHorizontal className="mr-2 h-4 w-4" /> Place a request
              </Button>
              <Button
                type="button"
                variant="outline"
                className="tap-feedback focus-ring h-auto justify-start whitespace-normal py-2 text-left"
                onClick={() => navigate(resolvedConfirmPath)}
              >
                <BadgeCheck className="mr-2 h-4 w-4" /> Confirm request matched
              </Button>
            </div>
          </div>
        </div>
      )}

      <nav
        data-mobile-bottom-nav="true"
        className="safe-bottom fixed inset-x-0 bottom-0 z-40 border-t border-border/70 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/75 md:hidden"
      >
      <div className="mx-auto grid h-16 max-w-xl grid-cols-5 px-1.5">
        {tabs.map((tab) => (
          tab.label === 'Explore' ? (
            <button
              key={tab.label}
              type="button"
              onClick={() => setExploreOpen((prev) => !prev)}
              aria-expanded={exploreOpen}
              className={cn(
                'tap-feedback focus-ring flex min-h-12 flex-col items-center justify-center gap-1 rounded-lg px-1 text-[9px] font-medium leading-tight transition-colors sm:text-[10px]',
                exploreOpen || tab.active ? 'text-primary' : 'text-muted-foreground hover:text-foreground',
              )}
              aria-label={tab.label}
            >
              <tab.icon className={cn('h-4 w-4', exploreOpen || tab.active ? 'text-primary' : 'text-muted-foreground')} />
              <span className="max-w-[56px] text-center leading-tight">{tab.label}</span>
            </button>
          ) : (
            <Link
              key={tab.label}
              to={tab.to}
              className={cn(
                'tap-feedback focus-ring flex min-h-12 flex-col items-center justify-center gap-1 rounded-lg px-1 text-[9px] font-medium leading-tight transition-colors sm:text-[10px]',
                tab.active ? 'text-primary' : 'text-muted-foreground hover:text-foreground',
              )}
              aria-label={tab.label}
            >
              <tab.icon className={cn('h-4 w-4', tab.active ? 'text-primary' : 'text-muted-foreground')} />
              <span className="max-w-[56px] text-center leading-tight">{tab.label}</span>
            </Link>
          )
        ))}
      </div>
      </nav>
    </>
  );
};

export default MobileBottomNav;
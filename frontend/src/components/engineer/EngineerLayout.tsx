import { Outlet } from 'react-router-dom';
import { SidebarProvider } from '@/components/ui/sidebar';
import EngineerSidebar from './EngineerSidebar';
import ICDBOAssistantWidget from '@/components/ai/ICDBOAssistantWidget';
import MobileBottomNav from '@/components/mobile/MobileBottomNav';

const EngineerLayout = () => {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <EngineerSidebar />
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto p-6 pb-24 md:pb-6">
            <Outlet />
          </div>
        </main>
      </div>
      <MobileBottomNav
        homePath="/engineer"
        homeActivePrefixes={['/engineer/home']}
        searchPath="/search"
        yourSpacePath="/engineer/profile"
        confirmRequestPath="/engineer/inbox"
      />
      <ICDBOAssistantWidget />
    </SidebarProvider>
  );
};

export default EngineerLayout;

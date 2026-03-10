import { Outlet } from 'react-router-dom';
import { SidebarProvider } from '@/components/ui/sidebar';
import EngineerSidebar from './EngineerSidebar';
import ICDBOAssistantWidget from '@/components/ai/ICDBOAssistantWidget';

const EngineerLayout = () => {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <EngineerSidebar />
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto p-6">
            <Outlet />
          </div>
        </main>
      </div>
      <ICDBOAssistantWidget />
    </SidebarProvider>
  );
};

export default EngineerLayout;

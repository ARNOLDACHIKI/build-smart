import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { mockPosts } from '@/lib/mockPosts';
import type { CommunityPost } from '@/lib/community';

type SimulationContextType = {
  isSimulationMode: boolean;
  setIsSimulationMode: (enabled: boolean) => void;
  simulationPosts: CommunityPost[];
  addSimulationPost: (post: CommunityPost) => void;
  resetSimulation: () => void;
  getSimulationPosts: (limit?: number) => CommunityPost[];
};

const SimulationContext = createContext<SimulationContextType | undefined>(undefined);

export const SimulationProvider = ({ children }: { children: ReactNode }) => {
  const [isSimulationMode, setIsSimulationMode] = useState(
    process.env.REACT_APP_SIMULATION_MODE === 'true'
  );
  const [simulationPosts, setSimulationPosts] = useState<CommunityPost[]>(
    isSimulationMode ? [...mockPosts].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ) : []
  );

  const addSimulationPost = useCallback((post: CommunityPost) => {
    setSimulationPosts((prev) => [post, ...prev]);
  }, []);

  const resetSimulation = useCallback(() => {
    setSimulationPosts(
      [...mockPosts].sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
    );
  }, []);

  const getSimulationPosts = useCallback((limit?: number) => {
    return limit ? simulationPosts.slice(0, limit) : simulationPosts;
  }, [simulationPosts]);

  const handleSetSimulationMode = useCallback((enabled: boolean) => {
    setIsSimulationMode(enabled);
    if (enabled) {
      resetSimulation();
    } else {
      setSimulationPosts([]);
    }
  }, [resetSimulation]);

  return (
    <SimulationContext.Provider
      value={{
        isSimulationMode,
        setIsSimulationMode: handleSetSimulationMode,
        simulationPosts,
        addSimulationPost,
        resetSimulation,
        getSimulationPosts,
      }}
    >
      {children}
    </SimulationContext.Provider>
  );
};

export const useSimulation = () => {
  const context = useContext(SimulationContext);
  if (!context) {
    throw new Error('useSimulation must be used within SimulationProvider');
  }
  return context;
};

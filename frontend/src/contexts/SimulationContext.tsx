import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { generateMockPosts, mockPosts } from '@/lib/mockPosts';
import type { CommunityPost } from '@/lib/community';

const INITIAL_SIMULATION_POSTS = 1200;
const MAX_SIMULATION_POSTS = 1500;
const SIMULATION_APPEND_BATCH = 20;
const SIMULATION_APPEND_INTERVAL_MS = 60_000;

type SimulationContextType = {
  isSimulationMode: boolean;
  setIsSimulationMode: (enabled: boolean) => void;
  simulationPosts: CommunityPost[];
  addSimulationPost: (post: CommunityPost) => void;
  refreshSimulation: () => void;
  resetSimulation: () => void;
  getSimulationPosts: (limit?: number) => CommunityPost[];
};

const SimulationContext = createContext<SimulationContextType | undefined>(undefined);

export const SimulationProvider = ({ children }: { children: ReactNode }) => {
  const [isSimulationMode, setIsSimulationMode] = useState(
    import.meta.env.VITE_SIMULATION_MODE === 'true'
  );
  const [simulationGeneration, setSimulationGeneration] = useState(0);
  const [simulationPosts, setSimulationPosts] = useState<CommunityPost[]>(
    isSimulationMode ? [...mockPosts].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ) : []
  );

  const sortPosts = useCallback((posts: CommunityPost[]) => {
    return [...posts].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, []);

  const createFreshSimulationPosts = useCallback(
    (generation = simulationGeneration) => {
      const startIndex = generation * MAX_SIMULATION_POSTS;
      return sortPosts(generateMockPosts(INITIAL_SIMULATION_POSTS, startIndex));
    },
    [simulationGeneration, sortPosts]
  );

  const refreshSimulation = useCallback(() => {
    setSimulationGeneration((current) => {
      const nextGeneration = current + 1;
      setSimulationPosts(sortPosts(generateMockPosts(INITIAL_SIMULATION_POSTS, nextGeneration * MAX_SIMULATION_POSTS)));
      return nextGeneration;
    });
  }, [sortPosts]);

  const addSimulationPost = useCallback((post: CommunityPost) => {
    setSimulationPosts((prev) => {
      const next = [post, ...prev].slice(0, MAX_SIMULATION_POSTS);
      return sortPosts(next);
    });
  }, [sortPosts]);

  const resetSimulation = useCallback(() => {
    refreshSimulation();
  }, [refreshSimulation]);

  const getSimulationPosts = useCallback((limit?: number) => {
    return limit ? simulationPosts.slice(0, limit) : simulationPosts;
  }, [simulationPosts]);

  useEffect(() => {
    if (!isSimulationMode) {
      return;
    }

    if (simulationPosts.length === 0) {
      setSimulationPosts(createFreshSimulationPosts());
    }

    const timer = window.setInterval(() => {
      setSimulationPosts((current) => {
        if (current.length >= MAX_SIMULATION_POSTS) {
          return current;
        }

        const nextCount = Math.min(SIMULATION_APPEND_BATCH, MAX_SIMULATION_POSTS - current.length);
        const nextStartIndex = simulationGeneration * MAX_SIMULATION_POSTS + current.length;
        const appendedPosts = generateMockPosts(nextCount, nextStartIndex);
        return sortPosts([...current, ...appendedPosts]);
      });
    }, SIMULATION_APPEND_INTERVAL_MS);

    return () => window.clearInterval(timer);
  }, [createFreshSimulationPosts, isSimulationMode, simulationGeneration, simulationPosts.length, sortPosts]);

  useEffect(() => {
    if (isSimulationMode && simulationPosts.length === 0) {
      setSimulationPosts(createFreshSimulationPosts());
    }
  }, [createFreshSimulationPosts, isSimulationMode, simulationPosts.length]);

  const handleSetSimulationMode = useCallback((enabled: boolean) => {
    setIsSimulationMode(enabled);
    if (enabled) {
      setSimulationPosts(createFreshSimulationPosts());
    } else {
      setSimulationPosts([]);
    }
  }, [createFreshSimulationPosts]);

  return (
    <SimulationContext.Provider
      value={{
        isSimulationMode,
        setIsSimulationMode: handleSetSimulationMode,
        simulationPosts,
        addSimulationPost,
        refreshSimulation,
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

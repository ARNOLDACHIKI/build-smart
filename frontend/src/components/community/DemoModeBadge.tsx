import { useSimulation } from '@/contexts/SimulationContext';

const DemoModeBadge = () => {
  const { isSimulationMode } = useSimulation();

  if (!isSimulationMode) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-2 rounded-full bg-[#BED234]/20 border border-[#BED234]/60 backdrop-blur-sm">
      <div className="flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-[#BED234] animate-pulse" />
        <span className="text-xs font-semibold text-[#BED234] tracking-wider">DEMO MODE</span>
      </div>
      <span className="text-[10px] text-slate-400 hidden sm:inline">
        — All activity is simulated
      </span>
    </div>
  );
};

export default DemoModeBadge;

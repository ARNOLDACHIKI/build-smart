import { useState } from 'react';
import { useSimulation } from '@/contexts/SimulationContext';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { RotateCcw, RefreshCcw } from 'lucide-react';

const SimulationSettings = () => {
  const { isSimulationMode, setIsSimulationMode, resetSimulation, simulationPosts } = useSimulation();

  const handleToggleSimulation = (checked: boolean) => {
    setIsSimulationMode(checked);
  };

  return (
    <div className="space-y-6 p-6 bg-[#0F1117] rounded-lg border border-[#2A2D3C]">
      <div>
        <h3 className="text-base font-bold text-slate-100 mb-4">Simulation Mode Settings</h3>
        <p className="text-sm text-slate-400 mb-4">
          Enable demo mode to generate realistic activity and test the community feed with simulated content.
        </p>
      </div>

      <div className="space-y-4">
        {/* Toggle Simulation */}
        <div className="flex items-center justify-between p-4 rounded-lg border border-[#2A2D3C] bg-[#1A1D2B]/50">
          <div className="flex-1">
            <Label className="text-sm font-semibold text-slate-100 cursor-pointer">
              Enable Simulation Mode
            </Label>
            <p className="text-xs text-slate-400 mt-1">
              Generate demo posts and simulate user activity
            </p>
          </div>
          <Switch
            checked={isSimulationMode}
            onCheckedChange={handleToggleSimulation}
          />
        </div>

        {/* Stats */}
        {isSimulationMode && (
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-[#1A1D2B] border border-[#2A2D3C]">
              <p className="text-xs text-slate-400">Total Demo Posts</p>
              <p className="text-lg font-bold text-[#BED234]">{simulationPosts.length}</p>
            </div>
            <div className="p-3 rounded-lg bg-[#1A1D2B] border border-[#2A2D3C]">
              <p className="text-xs text-slate-400">Status</p>
              <p className="text-sm font-semibold text-green-400">Active</p>
            </div>
          </div>
        )}

        {isSimulationMode && (
          <div className="p-3 rounded-lg bg-[#1A1D2B] border border-[#2A2D3C]">
            <p className="text-xs text-slate-400">Growth rule</p>
            <p className="text-sm font-semibold text-slate-100">Adds 20 new posts every 1 minute until 1,500 total</p>
          </div>
        )}

        {/* Action Buttons */}
        {isSimulationMode && (
          <div className="space-y-2">
            <Button
              onClick={resetSimulation}
              variant="outline"
              className="w-full border-[#2A2D3C] bg-[#1A1D2B] text-slate-200 hover:bg-[#232738]"
            >
              <RefreshCcw className="h-4 w-4 mr-2" />
              Refresh Content
            </Button>
            <Button
              onClick={resetSimulation}
              variant="outline"
              className="w-full border-[#2A2D3C] bg-[#1A1D2B] text-slate-200 hover:bg-[#232738]"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset to Fresh Feed
            </Button>
            <p className="text-xs text-slate-500 text-center">
              Refresh generates a new demo batch. Reset restores the current simulation feed.
            </p>
          </div>
        )}

        {/* Info Box */}
        <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
          <p className="text-xs text-amber-200">
            ⚠️ <strong>Demo Mode Enabled</strong> — All activity is simulated. This is for demo/testing only.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SimulationSettings;

'use client';

import NeuralGraph from "@/components/NeuralGraph";

export default function NeuralGraphPage() {
  return (
    <div className="flex-1 overflow-auto p-8 flex flex-col gap-6">
      <div>
        <h2 className="text-[13px] font-bold text-gray-800">Sarie Neural Memory Graph</h2>
        <p className="text-[11px] text-gray-400 mt-0.5">Visual map of Sarie's cached intelligence and knowledge nodes.</p>
      </div>
      <div className="flex-1 min-h-[600px]">
        <NeuralGraph />
      </div>
    </div>
  );
}

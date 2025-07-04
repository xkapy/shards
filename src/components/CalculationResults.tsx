import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronRight, Clock, Hammer, Target, BarChart3 } from "lucide-react";
import { formatTime, formatNumber, getRarityColor, getShardDetails } from "../utils";
import type { CalculationResult, RecipeTree, Data } from "../types";

interface CalculationResultsProps {
  result: CalculationResult;
  data: Data;
  targetShardName: string;
}

interface RecipeTreeNodeProps {
  tree: RecipeTree;
  data: Data;
  isTopLevel?: boolean;
  totalShardsProduced?: number;
  forceExpanded?: boolean;
}

const RecipeTreeNode: React.FC<RecipeTreeNodeProps> = ({ tree, data, isTopLevel = false, totalShardsProduced = tree.quantity, forceExpanded }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const shard = data.shards[tree.shard];

  // Use forceExpanded if provided, otherwise use local state
  const effectiveExpanded = forceExpanded !== undefined ? forceExpanded : isExpanded;

  if (tree.method === "direct") {
    return (
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
        <div className="flex items-center space-x-3">
          <div className="w-2 h-2 bg-green-400 rounded-full" />
          <div className="flex items-center space-x-3">
            <span className="text-slate-400">{tree.quantity}x</span>
            <span className={`font-medium cursor-help ${getRarityColor(shard.rarity)}`} title={getShardDetails(shard, true)}>
              {shard.name}
            </span>
            <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs font-medium rounded-full border border-green-500/30">direct</span>
          </div>
        </div>
        <div className="text-right flex flex-col items-end space-y-1">
          <div className="text-xs text-slate-400">{formatNumber(shard.rate)}/hour</div>
          <div className="text-xs text-slate-500 capitalize">
            {shard.type} • {shard.family}
          </div>
        </div>
      </motion.div>
    );
  }

  const input1 = tree.inputs![0];
  const input2 = tree.inputs![1];
  const input1Shard = data.shards[input1.shard];
  const input2Shard = data.shards[input2.shard];
  const displayQuantity = isTopLevel ? totalShardsProduced : tree.quantity;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
      <button onClick={() => setIsExpanded(!isExpanded)} className="w-full p-4 text-left hover:bg-white/5 transition-colors duration-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {effectiveExpanded ? <ChevronDown className="w-5 h-5 text-slate-400" /> : <ChevronRight className="w-5 h-5 text-slate-400" />}
            <div className="text-white">
              <span className="font-semibold">{displayQuantity}x </span>
              <span className={`font-medium cursor-help ${getRarityColor(shard.rarity)}`} title={getShardDetails(shard, false)}>
                {shard.name}
              </span>
              <span className="text-slate-400 ml-2">
                = {input1.quantity}x <span className={getRarityColor(input1Shard.rarity)}>{input1Shard.name}</span> + {input2.quantity}x{" "}
                <span className={getRarityColor(input2Shard.rarity)}>{input2Shard.name}</span>
              </span>
            </div>
          </div>
          <div className="text-right flex flex-col items-end space-y-1">
            <div className="flex items-center space-x-2">
              <span className="text-xs text-slate-500">fusions</span>
              <span className="text-sm font-medium text-white">{displayQuantity}</span>
            </div>
            <div className="text-xs text-slate-400 capitalize">
              {shard.type} • {shard.family}
            </div>
          </div>
        </div>
      </button>

      <AnimatePresence>
        {effectiveExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t border-white/10 p-4 space-y-3"
          >
            <RecipeTreeNode tree={input1} data={data} forceExpanded={forceExpanded} />
            <RecipeTreeNode tree={input2} data={data} forceExpanded={forceExpanded} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export const CalculationResults: React.FC<CalculationResultsProps> = ({ result, data, targetShardName }) => {
  const [forceExpandState, setForceExpandState] = useState<boolean | undefined>(undefined);

  const handleToggleAll = () => {
    if (forceExpandState === true) {
      setForceExpandState(false);
    } else {
      setForceExpandState(true);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div whileHover={{ scale: 1.02 }} className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 backdrop-blur-xl border border-purple-500/20 rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-slate-400 text-sm">Time per Shard</p>
              <p className="text-white font-semibold">{formatTime(result.timePerShard)}</p>
            </div>
          </div>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }} className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 backdrop-blur-xl border border-blue-500/20 rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <Target className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-slate-400 text-sm">Total Time</p>
              <p className="text-white font-semibold">{formatTime(result.totalTime)}</p>
            </div>
          </div>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }} className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 backdrop-blur-xl border border-green-500/20 rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-slate-400 text-sm">Shards Produced</p>
              <p className="text-white font-semibold">{result.totalShardsProduced}</p>
            </div>
          </div>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }} className="bg-gradient-to-br from-orange-500/10 to-red-500/10 backdrop-blur-xl border border-orange-500/20 rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
              <Hammer className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <p className="text-slate-400 text-sm">Total Fusions</p>
              <p className="text-white font-semibold">
                {result.totalFusions}x{result.craftTime > 1 / 12 && <span className="text-xs text-slate-400 block">{formatTime(result.craftTime)}</span>}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Materials Needed */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-white">Materials Needed</h3>
          <div className="text-sm text-slate-400">
            for {result.totalShardsProduced} {targetShardName} ({result.craftsNeeded} craft{result.craftsNeeded > 1 ? "s" : ""})
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {Array.from(result.totalQuantities).map(([shardId, quantity]) => {
            const shard = data.shards[shardId];
            const timeNeeded = quantity / shard.rate;

            return (
              <motion.div
                key={shardId}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.02 }}
                className="bg-white/5 border border-white/10 rounded-lg p-3"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">
                      {quantity}x <span className={getRarityColor(shard.rarity)}>{shard.name}</span>
                    </div>
                    <div className="text-xs text-slate-400">{formatNumber(shard.rate)}/hour</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-slate-400">{formatTime(timeNeeded)}</div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Fusion Tree */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">Fusion Tree</h3>
          <button onClick={handleToggleAll} className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors duration-200">
            {forceExpandState === false ? "Expand All" : "Collapse All"}
          </button>
        </div>

        <RecipeTreeNode tree={result.tree} data={data} isTopLevel={true} totalShardsProduced={result.totalShardsProduced} forceExpanded={forceExpandState} />
      </motion.div>
    </motion.div>
  );
};

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Play, Pause, RotateCcw, Activity, Code2, CheckCircle2, Clock, FastForward, SkipBack, SkipForward } from "lucide-react";
import { fetchAlgoDetails } from "../../services/dsaService";
import { getFramesForAlgo } from "../../utils/dsaGenerators";

// =========================================================================
// MAIN VISUALIZER COMPONENT (100% Generic Frame Player)
// =========================================================================
export default function AlgorithmVisualizer({ algo, onBack }) {
  const [algoDetails, setAlgoDetails] = useState(null);
  const [frames, setFrames] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(true);
  
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speedMs, setSpeedMs] = useState(150);
  
  const timerRef = useRef(null);

  // Fetch details and compute frames on the client side
  useEffect(() => {
    setLoadingDetails(true);
    
    // Compute frames synchronously on client
    const computedFrames = getFramesForAlgo(algo.name);
    setFrames(computedFrames);
    setCurrentStep(0);
    setIsPlaying(false);
    
    // Fetch details from MongoDB via API
    fetchAlgoDetails(algo.name)
      .then(res => {
        setAlgoDetails(res.data?.details || null);
      })
      .catch(() => {
        setAlgoDetails(null);
      })
      .finally(() => setLoadingDetails(false));
  }, [algo.name]);

  const isSupported = frames !== null && frames.length > 0;
  const isDone = isSupported && currentStep >= frames.length - 1;

  // Play loop
  useEffect(() => {
    if (isPlaying && !isDone) {
      timerRef.current = setInterval(() => {
        setCurrentStep(prev => {
          if (prev >= frames.length - 2) {
            setIsPlaying(false);
            return frames.length - 1;
          }
          return prev + 1;
        });
      }, speedMs);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isPlaying, isDone, speedMs, frames]);

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStep(0);
  };

  const currentFrame = isSupported ? frames[currentStep] : null;

  return (
    <div className="bg-panel border border-border rounded-[4px] overflow-hidden font-body flex flex-col min-h-[700px]">
      {/* Top Header */}
      <div className="border-b border-border px-6 py-4 bg-panel flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 -ml-2 rounded text-muted hover:text-txt hover:bg-panel2 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="font-display text-[20px] font-bold text-txt flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" /> {algo.name}
            </h2>
            <p className="text-[12px] text-muted font-mono">{algo.complexity}</p>
          </div>
        </div>
        
        {/* Controls */}
        {isSupported && (
          <div className="flex items-center gap-4">
            {/* Speed Control Slider */}
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-[11px] font-bold text-muted uppercase tracking-widest">Speed</span>
              <input 
                type="range" 
                min="20" 
                max="500" 
                step="10"
                value={520 - speedMs} 
                onChange={(e) => setSpeedMs(520 - Number(e.target.value))}
                className="w-24 accent-primary cursor-pointer"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={() => { setIsPlaying(false); setCurrentStep(Math.max(0, currentStep - 1)); }}
                disabled={currentStep === 0}
                className="p-2 rounded border border-border text-muted hover:bg-panel2 hover:text-txt transition-colors disabled:opacity-40"
                title="Step Back"
              >
                <SkipBack className="w-4 h-4" />
              </button>
              
              <button 
                onClick={handleReset}
                className="flex items-center justify-center p-2 rounded border border-border text-muted hover:bg-panel2 hover:text-txt transition-colors"
                title="Reset"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              
              <button 
                onClick={() => !isDone && setIsPlaying(!isPlaying)}
                disabled={isDone}
                className={`flex items-center gap-2 px-4 py-2 rounded font-bold text-[13px] transition-colors border ${
                  isPlaying 
                    ? "bg-amber-500/10 text-amber-500 border-amber-500/30 hover:bg-amber-500/20" 
                    : isDone 
                      ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/30 opacity-60 cursor-not-allowed" 
                      : "bg-primary text-white border-primary hover:bg-primary/90"
                }`}
              >
                {isDone ? <CheckCircle2 className="w-4 h-4" /> : isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {isDone ? "Done" : isPlaying ? "Pause" : "Play"}
              </button>
              
              <button 
                onClick={() => { setIsPlaying(false); setCurrentStep(Math.min(frames.length - 1, currentStep + 1)); }}
                disabled={isDone}
                className="p-2 rounded border border-border text-muted hover:bg-panel2 hover:text-txt transition-colors disabled:opacity-40"
                title="Step Forward"
              >
                <SkipForward className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-8 bg-bg flex flex-col items-center justify-start relative overflow-y-auto">
        {!isSupported && !algoDetails && !loadingDetails ? (
          <div className="text-center max-w-md my-auto">
            <Code2 className="w-12 h-12 text-muted mx-auto mb-4 opacity-40" />
            <h3 className="font-display font-bold text-[18px] text-txt mb-2">Visualization Coming Soon</h3>
            <p className="text-[13px] text-muted leading-relaxed">
              We are currently building the visualizer for <strong>{algo.name}</strong>. 
            </p>
          </div>
        ) : (
          <>
            {/* Visualizer Canvas (If supported) */}
            {isSupported && currentFrame && (
              <div className="w-full h-[300px] flex items-end justify-center gap-1 sm:gap-2 mb-12">
                <AnimatePresence>
                  {currentFrame.array.map((val, idx) => {
                    const isActive = currentFrame.active?.includes(idx);
                    const isSorted = currentFrame.sorted?.includes(idx);
                    const isSwapped = currentFrame.swapped && isActive;
                    return (
                      <motion.div
                        key={idx}
                        layout
                        initial={{ opacity: 0, scaleY: 0 }}
                        animate={{ opacity: 1, scaleY: 1 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        className={`relative w-8 sm:w-10 rounded-t-[4px] flex flex-col items-center justify-end overflow-hidden border-t border-l border-r ${
                          isSwapped
                            ? "bg-red-500 border-red-600"
                            : isActive 
                              ? "bg-amber-400 border-amber-500" 
                              : isSorted 
                                ? "bg-emerald-500 border-emerald-600" 
                                : "bg-primary/80 border-primary"
                        }`}
                        style={{ height: `${val}%` }}
                      >
                        <span className={`text-[10px] sm:text-[12px] font-bold mb-2 text-white`}>
                          {val}
                        </span>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}

            {/* Pseudo-code or Status Info */}
            <div className={`w-full max-w-2xl flex flex-col gap-4 ${!isSupported ? 'mt-4' : ''}`}>
              {loadingDetails ? (
                <div className="bg-panel border border-border rounded-[4px] p-8 flex items-center justify-center">
                  <div className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                </div>
              ) : algoDetails ? (
                <>
                  <div className="bg-panel border border-border rounded-[4px] p-5">
                    <h4 className="font-bold text-[13px] text-txt mb-2">Description</h4>
                    <p className="text-[13px] text-muted leading-relaxed">{algoDetails.description}</p>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                     <div className="bg-panel border border-border rounded-[4px] p-4 flex flex-col">
                        <span className="text-[11px] font-bold uppercase text-muted tracking-widest mb-1 flex items-center gap-1"><Clock className="w-3 h-3"/> Best Time</span>
                        <span className="font-mono text-[13px] font-semibold text-emerald-500">{algoDetails.bestTime}</span>
                     </div>
                     <div className="bg-panel border border-border rounded-[4px] p-4 flex flex-col">
                        <span className="text-[11px] font-bold uppercase text-muted tracking-widest mb-1 flex items-center gap-1"><Clock className="w-3 h-3"/> Worst Time</span>
                        <span className="font-mono text-[13px] font-semibold text-red-500">{algoDetails.worstTime}</span>
                     </div>
                     <div className="bg-panel border border-border rounded-[4px] p-4 flex flex-col">
                        <span className="text-[11px] font-bold uppercase text-muted tracking-widest mb-1 flex items-center gap-1"><Activity className="w-3 h-3"/> Space</span>
                        <span className="font-mono text-[13px] font-semibold text-primary">{algoDetails.spaceComplexity}</span>
                     </div>
                  </div>

                  <div className="bg-panel border border-border rounded-[4px] p-5">
                    <h4 className="font-bold text-[13px] text-txt mb-3 flex items-center gap-2 uppercase tracking-wider">
                      <Code2 className="w-4 h-4 text-primary" /> Pseudocode
                    </h4>
                    <pre className="text-[12px] font-mono text-muted bg-bg p-4 rounded-[4px] border border-border overflow-x-auto whitespace-pre-wrap">
                      {algoDetails.pseudoCode}
                    </pre>
                  </div>
                </>
              ) : null}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

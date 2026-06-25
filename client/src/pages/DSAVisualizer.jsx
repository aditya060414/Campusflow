import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Code2, 
  Terminal, 
  Search, 
  Braces, 
  Network, 
  Layers, 
  Zap, 
  Split, 
  CornerDownRight,
  Hash,
  Sigma,
  Type
} from "lucide-react";
import toast from "react-hot-toast";
import AlgorithmVisualizer from "../components/dsa/AlgorithmVisualizer";
import { fetchDSATaxonomy } from "../services/dsaService";

const CATEGORY_ICONS = {
  1: <Braces className="w-5 h-5" />,
  2: <Search className="w-5 h-5" />,
  3: <Network className="w-5 h-5" />,
  4: <Layers className="w-5 h-5" />,
  5: <Zap className="w-5 h-5" />,
  6: <Split className="w-5 h-5" />,
  7: <CornerDownRight className="w-5 h-5" />,
  8: <Hash className="w-5 h-5" />,
  9: <Sigma className="w-5 h-5" />,
  10: <Type className="w-5 h-5" />
};

const TAXONOMY_DATA = [
  {
    id: 1,
    category: "Sorting algorithms",
    description: "The classics from O(n²) basics to O(n log n) powerhouses and linear-time special cases.",
    algorithms: [
      { name: "Bubble", complexity: "O(n²)" },
      { name: "Selection", complexity: "O(n²)" },
      { name: "Insertion", complexity: "O(n²)" },
      { name: "Merge", complexity: "O(n log n)" },
      { name: "Quick", complexity: "O(n log n) avg" },
      { name: "Heap / Radix", complexity: "O(n log n) / O(nk)" }
    ]
  },
  {
    id: 2,
    category: "Searching algorithms",
    description: "Linear for unsorted data, binary and variants for sorted arrays.",
    algorithms: [
      { name: "Linear search", complexity: "O(n)" },
      { name: "Binary search", complexity: "O(log n)" },
      { name: "Ternary / Jump", complexity: "O(log n) / O(√n)" },
      { name: "Exponential / Fib", complexity: "for sorted arrays" }
    ]
  },
  {
    id: 3,
    category: "Graph algorithms",
    description: "The biggest family: BFS/DFS traversal, shortest-path, minimum spanning trees, SCC, and Union-Find.",
    algorithms: [
      { name: "BFS", complexity: "Level order" },
      { name: "DFS", complexity: "Depth first" },
      { name: "Dijkstra", complexity: "Non-neg edges" },
      { name: "Bellman-Ford", complexity: "Neg edges ok" },
      { name: "Floyd-W.", complexity: "All pairs" },
      { name: "A*", complexity: "Heuristic" },
      { name: "Prim / Kruskal", complexity: "Min spanning tree" },
      { name: "Topological sort", complexity: "DAGs" },
      { name: "Tarjan / Kosaraju", complexity: "Strongly conn. comp." },
      { name: "Union-Find (DSU)", complexity: "Disjoint sets" }
    ]
  },
  {
    id: 4,
    category: "Dynamic programming",
    description: "Memoization vs tabulation approaches, applied to classic problems.",
    algorithms: [
      { name: "Memoization", complexity: "Top-down" },
      { name: "Tabulation", complexity: "Bottom-up" },
      { name: "0/1 Knapsack", complexity: "Classic DP" },
      { name: "LCS / LIS", complexity: "Subsequences" },
      { name: "Matrix chain / Edit", complexity: "Interval DP" }
    ]
  },
  {
    id: 5,
    category: "Greedy algorithms",
    description: "Local-optimal choices that yield global optima.",
    algorithms: [
      { name: "Activity select.", complexity: "Interval scheduling" },
      { name: "Huffman coding", complexity: "Optimal prefix" },
      { name: "Fractional knap.", complexity: "Ratio-based" },
      { name: "Job sequencing", complexity: "Deadline scheduling" }
    ]
  },
  {
    id: 6,
    category: "Divide & conquer",
    description: "Split, solve recursively, combine.",
    algorithms: [
      { name: "Merge sort", complexity: "Split & merge" },
      { name: "Quick sort", complexity: "Partition pivot" },
      { name: "Binary search", complexity: "Halve & recurse" },
      { name: "Strassen / Karatsuba", complexity: "Fast multiply" }
    ]
  },
  {
    id: 7,
    category: "Backtracking",
    description: "Explore + prune.",
    algorithms: [
      { name: "N-Queens", complexity: "Constraint place" },
      { name: "Sudoku solver", complexity: "Cell filling" },
      { name: "Permutations", complexity: "Generate all" },
      { name: "Maze / rat in maze", complexity: "Path finding" }
    ]
  },
  {
    id: 8,
    category: "Bit manipulation",
    description: "XOR tricks, masking, Brian Kernighan's bit-counting, power-of-2 checks — all O(1) space magic.",
    algorithms: [
      { name: "AND / OR / XOR", complexity: "Bitwise ops" },
      { name: "Bit masking", complexity: "Subset tricks" },
      { name: "Count set bits", complexity: "Brian Kernighan" },
      { name: "Power of 2 / Swap", complexity: "No extra space" }
    ]
  },
  {
    id: 9,
    category: "Mathematical algorithms",
    description: "Number theory foundations.",
    algorithms: [
      { name: "GCD / LCM", complexity: "Euclidean alg." },
      { name: "Sieve of Eratosth.", complexity: "Prime generation" },
      { name: "Fast exponent.", complexity: "Binary pow" },
      { name: "Modular arithmetic", complexity: "Inverse / CRT" }
    ]
  },
  {
    id: 10,
    category: "String algorithms",
    description: "Pattern matching algorithms.",
    algorithms: [
      { name: "KMP", complexity: "Failure function" },
      { name: "Rabin-Karp", complexity: "Rolling hash" },
      { name: "Z-algorithm", complexity: "Prefix matching" },
      { name: "Boyer-Moore", complexity: "Skip & match" },
      { name: "Trie / Suffix arr.", complexity: "Pattern index" }
    ]
  }
];

export default function DSAVisualizer() {
  const [taxonomy, setTaxonomy] = useState(TAXONOMY_DATA);
  const [selectedAlgo, setSelectedAlgo] = useState(null);

  if (selectedAlgo) {
    return (
      <AlgorithmVisualizer 
        algo={selectedAlgo} 
        onBack={() => setSelectedAlgo(null)} 
      />
    );
  }

  return (
    <div className="bg-panel border border-border rounded-[4px] overflow-hidden font-body transition-colors duration-150">
      {/* Header */}
      <div className="border-b border-border px-6 sm:px-8 py-5 bg-panel flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 flex items-center justify-center bg-primary/10 text-primary rounded-[4px] border border-primary/20">
            <Code2 className="w-5 h-5 stroke-[1.75]" />
          </div>
          <div>
            <h1 className="font-display text-[20px] sm:text-[26px] font-bold text-txt tracking-tight">DSA Algorithms Visualizer</h1>
            <p className="text-[12px] text-muted">Topic-wise breakdown of Data Structures & Algorithms</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 sm:p-8 bg-bg min-h-[600px]">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {taxonomy.map((topic, index) => (
              <motion.div 
                key={topic.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-panel border border-border rounded-[4px] overflow-hidden flex flex-col hover:border-primary/50 transition-colors"
              >
                {/* Card Header */}
                <div className="px-5 py-4 border-b border-border bg-panel2 flex items-start gap-3">
                  <div className="mt-0.5 text-primary">
                    {CATEGORY_ICONS[topic.id] || <Terminal className="w-5 h-5" />}
                  </div>
                  <div>
                    <h2 className="font-display font-bold text-[15px] text-txt flex items-center gap-2">
                      <span className="text-muted/50 font-mono text-[13px]">0{topic.id}</span>
                      {topic.category}
                    </h2>
                    <p className="text-[12px] text-muted mt-1 leading-relaxed">
                      {topic.description}
                    </p>
                  </div>
                </div>

                {/* Algorithm List */}
                <div className="flex-1 p-5 bg-panel">
                  <ul className="space-y-1">
                    {topic.algorithms.map((algo, i) => (
                      <li 
                        key={i} 
                        onClick={() => setSelectedAlgo(algo)}
                        className="flex items-center justify-between group cursor-pointer hover:bg-panel2 p-2 rounded -mx-2 transition-colors"
                      >
                        <span className="text-[13px] font-semibold text-txt group-hover:text-primary transition-colors">
                          {algo.name}
                        </span>
                        <span className="inline-flex items-center justify-center px-2 py-1 bg-bg border border-border rounded-[3px] text-[11px] font-mono font-medium text-muted">
                          {algo.complexity}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
      </div>
    </div>
  );
}

import React from "react";

export function Background() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-[-1]">
      {/* Decorative Blueprint Lines */}
      <div className="absolute top-1/4 left-1/4 w-px h-32 bg-blueprint-blue/30 -rotate-45 hidden md:block z-0"></div>
      <div className="absolute top-1/3 right-1/4 w-px h-48 bg-blueprint-blue/30 rotate-12 hidden md:block z-0"></div>

      {/* Floating Background Languages/Platforms & Snippets */}
      <div className="absolute inset-0 hidden md:grid grid-cols-3 grid-rows-4 gap-8 p-12 pointer-events-none">
        
        {/* Row 1 */}
        <div className="flex items-center justify-start">
          <span className="text-6xl font-sketch text-blueprint-blue/10 -rotate-12 select-none">C++</span>
        </div>
        <div className="flex items-center justify-center">
          <pre className="text-[10px] font-mono text-sketch-black/10 rotate-3 select-none leading-tight">
{`def dfs(node, visited):
  if node in visited: return
  visited.add(node)
  for child in graph[node]:
    dfs(child, visited)`}
          </pre>
        </div>
        <div className="flex items-center justify-end">
          <span className="text-7xl font-sketch text-sketch-black/10 rotate-12 select-none">Java</span>
        </div>

        {/* Row 2 */}
        <div className="flex items-center justify-start">
          <span className="text-4xl font-sketch text-sketch-black/10 -rotate-12 select-none">Codeforces</span>
        </div>
        <div className="flex items-center justify-center">
          <span className="text-3xl font-sketch text-sketch-black/10 -rotate-12 select-none">O(N log N)</span>
        </div>
        <div className="flex items-center justify-end">
          <span className="text-3xl font-sketch text-sketch-black/10 rotate-45 select-none">Go</span>
        </div>

        {/* Row 3 */}
        <div className="flex items-center justify-start">
          <pre className="text-[10px] font-mono text-blueprint-blue/10 -rotate-3 select-none leading-tight">
{`int l = 0, r = n - 1;
while (l <= r) {
  int m = l + (r - l) / 2;
  if (arr[m] == x) return m;
  if (arr[m] < x) l = m + 1;
  else r = m - 1;
}`}
          </pre>
        </div>
        <div className="flex items-center justify-center">
          <span className="text-5xl font-sketch text-sketch-black/10 rotate-6 select-none">Python</span>
        </div>
        <div className="flex items-center justify-end">
          <span className="text-4xl font-sketch text-blueprint-blue/10 rotate-12 select-none">DP[i][j]</span>
        </div>

        {/* Row 4 */}
        <div className="flex items-center justify-start">
          <span className="text-4xl font-sketch text-blueprint-blue/10 -rotate-12 select-none">CodeChef</span>
        </div>
        <div className="flex items-center justify-center">
          <span className="text-5xl font-sketch text-blueprint-blue/10 rotate-3 select-none">Rust</span>
        </div>
        <div className="flex flex-col items-end justify-center gap-2">
          <span className="text-6xl font-sketch text-blueprint-blue/10 -rotate-6 select-none">LeetCode</span>
          <pre className="text-[10px] font-mono text-sketch-black/10 rotate-6 select-none leading-tight text-right">
{`priority_queue<pii, vector<pii>, greater<pii>> pq;
pq.push({0, start});
while(!pq.empty()){
    int u = pq.top().second;
    pq.pop();
}`}
          </pre>
        </div>

      </div>
    </div>
  );
}

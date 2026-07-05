import { lazy, Suspense } from "react";

const RouteOptimizerInner = lazy(() => import("./RouteOptimizerInner"));

export default function RouteOptimizer(props) {
  return (
    <Suspense fallback={
      <div className="h-[400px] flex items-center justify-center bg-slate-100 rounded-xl text-slate-400 text-sm">
        Loading route optimizer…
      </div>
    }>
      <RouteOptimizerInner {...props} />
    </Suspense>
  );
}
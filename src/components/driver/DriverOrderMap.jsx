import { lazy, Suspense } from "react";

const DriverOrderMapInner = lazy(() => import("./DriverOrderMapInner"));

export default function DriverOrderMap(props) {
  return (
    <Suspense fallback={
      <div className="h-[300px] flex items-center justify-center bg-slate-100 rounded-xl text-slate-400 text-sm">
        Loading map…
      </div>
    }>
      <DriverOrderMapInner {...props} />
    </Suspense>
  );
}
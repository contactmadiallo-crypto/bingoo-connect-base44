import { lazy, Suspense } from "react";

const DeliveryMapInner = lazy(() => import("./DeliveryMapInner"));

export default function DeliveryMap(props) {
  return (
    <Suspense fallback={
      <div className="h-[450px] flex items-center justify-center bg-slate-100 rounded-xl text-slate-400 text-sm">
        Loading map…
      </div>
    }>
      <DeliveryMapInner {...props} />
    </Suspense>
  );
}
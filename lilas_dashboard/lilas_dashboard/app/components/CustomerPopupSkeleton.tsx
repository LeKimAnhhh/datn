import { cn } from "../lib/utils";

export default function CustomerPopupSkeleton() {
  return (
    <div
      className={cn(
        "p-4 3xl:p-6 bg-[#F2F2F7] rounded-3xl",
        "h-[90vh] 3xl:h-[80vh] w-[60vw]"
      )}
    >
      <div className="flex flex-col gap-4 h-full">
        <div className="min-h-8 3xl:min-h-10 w-1/3 bg-slate-300 rounded-md animate-pulse" />

        <div className="grid grid-cols-6 grid-rows-2 gap-4 h-full">
          <div className="col-span-3 h-full bg-slate-300 rounded-2xl animate-pulse" />
          <div className="col-span-3 h-full bg-slate-300 rounded-2xl animate-pulse" />
          <div className="col-span-3 row-span-2 col-start-4 row-start-1 h-full bg-slate-300 rounded-2xl animate-pulse" />
        </div>

        <div className="min-h-8 3xl:min-h-10 w-[150px] bg-slate-300 rounded-md animate-pulse self-end" />
      </div>
    </div>
  );
}

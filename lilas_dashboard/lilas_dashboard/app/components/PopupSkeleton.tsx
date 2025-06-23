import { cn } from "../lib/utils";

interface PopupSkeletonProps {
  type?:
    | "invoice"
    | "purchase"
    | "return"
    | "inspection"
    | "transfer"
    | "transport";
}

export default function PopupSkeleton({ type }: PopupSkeletonProps) {
  return (
    <div
      className={cn(
        "p-4 3xl:p-6 bg-[#F2F2F7] rounded-2xl",
        type === "invoice" && "w-full xl:w-[90vw] 3xl:w-[78vw] xl:h-[97vh] 3xl:h-[90vh]",
        type === "purchase" && "w-full xl:w-[90vw] 3xl:w-[73vw] h-full xl:h-[95vh] 3xl:h-[800px]",
        type === "return" && "w-full xl:w-[90vw] 3xl:w-[73vw] h-full xl:h-[95vh] 3xl:h-[800px]",
        type === "inspection" && "w-full xl:w-[80vw] 3xl:w-[78vw] h-full xl:h-[95vh] 3xl:h-[760px]",
        type === "transfer" && "w-full xl:w-[73vw] h-full xl:h-[91vh] 3xl:h-[800px]",
        type === "transport" && "w-full xl:w-[80%] 3xl:w-[78%] h-full xl:h-[83vh] 3xl:h-[80vh]",
      )}
    >
      <div className="flex flex-col gap-4 h-full">
        <div className="min-h-8 3xl:min-h-10 w-1/3 bg-slate-300 rounded-md animate-pulse" />

        <div className="grid grid-cols-8 gap-4 h-full">
          <div className="col-span-5 h-full bg-slate-300 rounded-2xl animate-pulse" />
          <div className="col-span-3 h-full bg-slate-300 rounded-2xl animate-pulse" />
        </div>

        <div className="grid grid-cols-7 gap-4 h-full">
          <div className="col-span-5 h-full bg-slate-300 rounded-2xl animate-pulse" />
          <div className="col-span-2 h-full bg-slate-300 rounded-2xl animate-pulse" />
        </div>

        <div className="grid grid-cols-3 gap-2 self-end w-2/3 md:w-1/2 xl:w-1/3">
          <div className="min-h-8 3xl:min-h-10 w-full bg-slate-300 rounded-md animate-pulse" />
          <div className="min-h-8 3xl:min-h-10 w-full bg-slate-300 rounded-md animate-pulse self-end" />
          <div className="min-h-8 3xl:min-h-10 w-full bg-slate-300 rounded-md animate-pulse self-end" />
        </div>
      </div>
    </div>
  );
}

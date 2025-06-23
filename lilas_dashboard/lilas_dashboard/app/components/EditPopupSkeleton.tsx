import { cn } from "../lib/utils";

interface EditPopupSkeletonProps {
  type: "supplier" | "customer-gr" | "employee" | "account";
}

export default function EditPopupSkeleton({ type }: EditPopupSkeletonProps) {
  const length = type === "employee" ? 6 : type === "account" ? 3 : 5; 

  return (
    <div
      className={cn(
        "p-4 3xl:p-6 bg-[#F2F2F7] rounded-3xl",
        type === "supplier" && "w-[612px] h-[590px]",
        type === "customer-gr" && "w-[612px] h-[620px]",
        type === "employee" && "w-[612px] h-[660px]",
        type === "account" && "w-[612px] h-[450px]",
      )}
    >
      <div className="flex flex-col gap-4 h-full">
        <div className="h-10 w-1/3 bg-slate-300 rounded-md animate-pulse" />

        <div className="flex flex-col gap-4 w-full h-full justify-evenly">
          {Array.from({ length: length }).map((_, index) => (
            <div
              key={index}
              className="w-full bg-slate-300 rounded-md animate-pulse h-10"
            />
          ))}
        </div>

        <div className="h-10 w-[150px] bg-slate-300 rounded-md animate-pulse self-end" />
      </div>
    </div>
  );
}

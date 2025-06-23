"use client";

import Image from "next/image";
import { cn } from "../lib/utils";
import default_image from "@/public/no-data.png";

interface NoDataProps extends React.HTMLAttributes<HTMLDivElement> {
  message?: string;
  image?: string;
}

export default function NoData({
  message,
  image,
  className,
  ...props
}: NoDataProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4",
        className
      )}
      {...props}
    >
      <Image
        src={image ? image : default_image}
        className="object-cover"
        alt="No data"
        width={110}
        height={97}
      />
      <p className="text-[14px] 2xl:text-lg text-center text-[#242428]">
        {message ? message : "Không có dữ liệu"}
      </p>
    </div>
  );
}

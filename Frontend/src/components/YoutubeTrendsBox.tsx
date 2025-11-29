import React from "react";
import { Card, CardContent } from "@/components/ui/card";

export default function YouTubeTrendsBox({
  title,
  videos,
}: {
  title: string;
  videos: any[];
}) {
  return (
    <Card className="rounded-2xl border-none shadow-lg bg-[#1A202C] p-6 h-full flex flex-col">
      <CardContent className="flex-1 flex flex-col">
        <h3 className="text-xl font-semibold mb-4 text-white">{title}</h3>
        {/* Scrollable card list, fills all available space */}
        <div
          className="overflow-y-auto custom-scrollbar flex-1"
          style={{ maxHeight: "320px", minHeight: "150px" }}
        >
          <ul className="space-y-4">
            {videos.map((v, idx) => (
              <li
                key={idx}
                className={`
                  w-full rounded-lg px-4 py-3 bg-[#192236] border-l-4 border-[#2B6CB0] shadow-sm
                  flex flex-col cursor-pointer transition
                  hover:bg-[#2B6CB0]/30
                `}
                title="Open in YouTube"
                onClick={() => window.open(v.url, "_blank")}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="font-semibold text-white truncate">{v.title}</div>
                  {v.is_live && (
                    <span className="px-2 py-0.5 rounded-full bg-[#DC2626] text-white text-xs font-bold shrink-0 ml-2">
                      LIVE
                    </span>
                  )}
                </div>
                <div className="text-xs text-[#A0AEC0] flex gap-2 items-center mt-1">
                  <span className="font-medium">{v.channel}</span>
                  <span className="font-thin mx-1">·</span>
                  <span>{v.view_count}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

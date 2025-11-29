import React from "react";
import { Sparkles } from "lucide-react";

type NewsItem = {
  headline: string;
  source: string;
  updated_at: string;
  minutes_since: number | null;
  is_top_trending: boolean;
};

function formatMinutes(minutes: number | null): string {
  if (minutes == null) return "";
  if (minutes === Infinity) return "Earlier";
  if (minutes > 1439) return "Yesterday";
  if (minutes >= 60) return `${Math.floor(minutes / 60)}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return "now";
}

export default function NewsList({ news }: { news: NewsItem[] }) {
  return (
    <ul className="space-y-4">
      {news.map((item, idx) => (
        <li
          key={idx}
          className={`p-4 rounded-xl shadow-sm transition-none relative
            ring-1 ring-inset
            ${
              item.is_top_trending
                ? "bg-gradient-to-r from-[#203165]/80 via-[#2B6CB0]/60 to-[#202c43]/90 border-l-4 border-[#2B6CB0] ring-[#2776EB] shadow-lg"
                : "bg-[#181d27]/85 border-l-4 border-[#334155] ring-[#334155]"
            }
          `}
        >
          <div className="flex flex-col gap-1">
            <span
              className={`font-extrabold leading-tight tracking-tight text-lg max-w-full truncate
                ${
                  item.is_top_trending
                    ? "text-transparent bg-clip-text bg-gradient-to-r from-[#71B7F6] via-[#2776EB] to-[#7DD3FC]"
                    : "text-[#E1E7EF] opacity-90"
                }
              `}
              style={{
                fontFamily: "'Inter', 'Segoe UI', 'Arial', sans-serif",
              }}
              title={item.headline}
            >
              {item.headline}
            </span>
            <span className="text-xs text-[#B2BAD0] flex gap-2 items-center pt-1">
              <span className="font-medium">{item.source}</span>
              <span className="font-thin mx-1">·</span>
              <span>{formatMinutes(item.minutes_since)}</span>
              {item.is_top_trending && (
                <span className="ml-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#2776EB] text-white font-bold text-xs shadow transition">
                  <Sparkles className="w-3 h-3 mr-0.5" />
                  TOP
                </span>
              )}
            </span>
          </div>
        </li>
      ))}
    </ul>
  );
}

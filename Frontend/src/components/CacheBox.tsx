import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { RefreshCw } from "lucide-react";

interface CacheSummaryItem {
  topic: string;
  repeated_count: number;
  total_viewers: number;
  trend_probability: number;
  reason_for_selection: string;
}

interface CacheDetailItem {
  topic: string;
  related_headlines: string[];
  summary: string;
}

interface CacheData {
  indexed_local_news?: string | number;
  indexed_youtube_videos?: string | number;
  last_news_sync?: string;
  local_db_size?: string;
  metadata_summary?: CacheSummaryItem[];
  detailed_facts?: CacheDetailItem[];
}

interface CacheBoxProps {
  cacheData: CacheData;
  cacheSummaryIcons: React.ElementType[];
}

export default function CacheBox({
  cacheData,
  cacheSummaryIcons,
}: CacheBoxProps) {
  const [modal, setModal] = useState<null | CacheDetailItem>(null);

  const summary = [
    {
      label: "Indexed local news",
      value: cacheData?.indexed_local_news ?? "",
      icon: cacheSummaryIcons[0],
    },
    {
      label: "Indexed YouTube videos",
      value: cacheData?.indexed_youtube_videos ?? "",
      icon: cacheSummaryIcons[1],
    },
    {
      label: "Last news sync",
      value: cacheData?.last_news_sync ?? "",
      icon: cacheSummaryIcons[2],
    },
    {
      label: "Local DB size",
      value: cacheData?.local_db_size ?? "",
      icon: cacheSummaryIcons[3],
    },
  ];

  // ✅ Sort metadata_summary by total_viewers (Descending)
  const summarySorted = [...(cacheData?.metadata_summary ?? [])].sort(
    (a, b) => b.total_viewers - a.total_viewers
  );

  function getDetail(topic: string) {
    return cacheData?.detailed_facts?.find((df) => df.topic === topic) ?? null;
  }

  return (
    <>
      <Card className="rounded-2xl border-none shadow-lg bg-[#1A202C] p-6 blink-border relative overflow-visible">
        <CardContent>
          <div className="flex items-center mb-6">
            <h2 className="text-3xl font-bold tracking-tight text-white mr-3">
              Recent Cache
            </h2>
            <div className="flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-[#3B82F6] spinner" />
              <span className="font-medium text-xs text-[#94A3B8]">
                Update Worker:{" "}
                <span className="text-[#31C48D] font-bold">Running</span>
              </span>
            </div>
          </div>

          <div className="flex gap-4 min-h-[260px]">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 grid-rows-2 gap-4">
              {summary.map((c, i) => (
                <div
                  key={i}
                  className="flex flex-col items-center justify-center min-w-[110px] min-h-[90px] bg-[#141b23] rounded-xl p-3 gap-2 shadow border border-[#334155]"
                >
                  <c.icon className="w-7 h-7 text-white mb-1" />
                  <span className="font-bold text-lg text-white">{c.value}</span>
                  <span className="text-xs text-[#cbd5e1] text-center">
                    {c.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Metadata Summary List */}
            <div
              className="flex-1 min-h-0 ml-4 bg-[#141b23] rounded-xl p-3 overflow-y-auto custom-scrollbar"
              style={{ maxHeight: "350px" }}
            >
              <div className="space-y-4">
                {summarySorted.map((item, idx) => (
                  <div
                    key={idx}
                    className="rounded-lg border border-[#333] p-2 bg-[#20283a]/70 cursor-pointer transition hover:shadow-lg"
                    onClick={() => {
                      const detail = getDetail(item.topic);
                      if (detail) setModal(detail);
                    }}
                  >
                    <div
                      className="font-semibold text-white text-md truncate"
                      title={item.topic}
                    >
                      {item.topic}
                    </div>
                    <div className="text-xs text-[#A0AEC0]">
                      <span>Count: {item.repeated_count}</span>{" "}
                      <span className="ml-2">
                        Viewers: {item.total_viewers}
                      </span>{" "}
                      <span className="ml-2">
                        Trend: {(item.trend_probability * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="text-xs text-[#FBBF24] mt-1">
                      {item.reason_for_selection}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-md">
          <div className="bg-[#232840] rounded-2xl shadow-2xl border-2 border-[#2276fa] px-8 py-8 max-w-2xl w-full relative animate-pop">
            <button
              onClick={() => setModal(null)}
              className="absolute top-5 right-6 text-[#62c9ff] bg-black/10 hover:bg-[#2b6cb0] rounded-full px-2 py-1 transition text-xl"
              aria-label="Close"
            >
              &#10005;
            </button>
            <h2 className="font-bold text-2xl mb-3 text-white">{modal.topic}</h2>
            <div className="text-lg mb-2 text-[#ffdc80] font-medium">
              {modal.summary}
            </div>
            <div className="mt-3">
              <div className="text-base font-bold mb-1 text-[#2B6CB0]">
                Related headlines:
              </div>
              <ul className="list-disc ml-6 space-y-2 text-[#B8DFEE]">
                {modal.related_headlines.map((h, i) => (
                  <li key={i}>{h}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes pop {
          0% {
            transform: scale(0.88) translateY(40px);
            opacity: 0;
          }
          100% {
            transform: scale(1) translateY(0);
            opacity: 1;
          }
        }
        .animate-pop {
          animation: pop 0.18s cubic-bezier(0.44, 1.88, 0.72, 0.92) 1;
        }
      `}</style>
    </>
  );
}

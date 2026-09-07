"use client";

import { useState } from "react";
import { generateSvgPath, formatRupiah } from "@/lib/intelligence/analytics";

export interface TrendChartItem {
  date: string;
  label: string;
  appointments: number;
  revenue: number;
}

interface TrendChartProps {
  data: TrendChartItem[];
  title?: string;
  metric?: "revenue" | "appointments";
}

export function TrendChart({
  data,
  title = "Tren Pendapatan & Kunjungan",
}: TrendChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [activeMetric, setActiveMetric] = useState<"revenue" | "appointments">("revenue");

  if (!data || data.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-6 shadow-xs">
        <h2 className="text-base font-semibold text-foreground">{title}</h2>
        <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
          Tidak ada data untuk periode ini.
        </div>
      </div>
    );
  }

  const values = data.map((d) => (activeMetric === "revenue" ? d.revenue : d.appointments));
  const maxValue = Math.max(...values, 1);
  const minValue = 0;

  // Coordinate space: width 100%, viewBox 0 0 1000 300 with 40px top/bottom padding
  const svgWidth = 1000;
  const svgHeight = 260;
  const paddingTop = 20;
  const paddingBottom = 40;
  const chartHeight = svgHeight - paddingTop - paddingBottom;

  const points = data.map((d, index) => {
    const x =
      data.length === 1
        ? svgWidth / 2
        : (index / (data.length - 1)) * (svgWidth - 60) + 30;
    const val = activeMetric === "revenue" ? d.revenue : d.appointments;
    const normalizedY =
      chartHeight - ((val - minValue) / (maxValue - minValue)) * chartHeight;
    const y = paddingTop + normalizedY;
    return { x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 };
  });

  // Base Y for area bottom (chart floor)
  const floorY = paddingTop + chartHeight;

  // Custom SVG path with floorY
  const pathD = points
    .map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`))
    .join(" ");
  const firstX = points[0]?.x ?? 0;
  const lastX = points[points.length - 1]?.x ?? svgWidth;
  const areaD = `${pathD} L ${lastX} ${floorY} L ${firstX} ${floorY} Z`;

  const hoveredItem = hoveredIndex !== null ? data[hoveredIndex] : null;
  const hoveredPoint = hoveredIndex !== null ? points[hoveredIndex] : null;

  // Format tick labels for gridlines
  const yTicks = [0, 0.33, 0.66, 1].map((ratio) => {
    const val = minValue + (maxValue - minValue) * ratio;
    const y = paddingTop + chartHeight - ratio * chartHeight;
    return {
      y,
      label:
        activeMetric === "revenue"
          ? val >= 1_000_000
            ? `${(val / 1_000_000).toFixed(1)} jt`
            : formatRupiah(val)
          : Math.round(val).toString(),
    };
  });

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-xs">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-foreground">{title}</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Grafik visualisasi pergerakan harian berbasis waktu Indonesia Barat (WIB)
          </p>
        </div>
        <div className="flex items-center rounded-lg border border-border bg-muted/40 p-1 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveMetric("revenue")}
            className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
              activeMetric === "revenue"
                ? "bg-background text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Omzet (Rp)
          </button>
          <button
            type="button"
            onClick={() => setActiveMetric("appointments")}
            className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
              activeMetric === "appointments"
                ? "bg-background text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Janji & Kunjungan
          </button>
        </div>
      </div>

      <div className="relative mt-6">
        {/* Tooltip Overlay */}
        {hoveredItem && hoveredPoint && (
          <div
            className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-full rounded-lg border border-border bg-popover/95 px-3 py-2 text-xs shadow-md backdrop-blur-xs transition-all duration-75"
            style={{
              left: `${(hoveredPoint.x / svgWidth) * 100}%`,
              top: `${(hoveredPoint.y / svgHeight) * 100 - 4}%`,
            }}
          >
            <div className="font-semibold text-popover-foreground">{hoveredItem.label}</div>
            <div className="mt-1 flex flex-col gap-0.5 text-muted-foreground">
              <span className="flex items-center justify-between gap-3">
                <span>Pendapatan:</span>
                <span className="font-medium text-foreground">{formatRupiah(hoveredItem.revenue)}</span>
              </span>
              <span className="flex items-center justify-between gap-3">
                <span>Kunjungan:</span>
                <span className="font-medium text-foreground">{hoveredItem.appointments} pasien</span>
              </span>
            </div>
          </div>
        )}

        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full overflow-visible"
          style={{ height: "260px" }}
        >
          <defs>
            <linearGradient id="trendOrangeGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f38218" stopOpacity="0.35" />
              <stop offset="85%" stopColor="#f38218" stopOpacity="0.05" />
              <stop offset="100%" stopColor="#f38218" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Grid lines & Y-axis labels */}
          {yTicks.map((tick, idx) => (
            <g key={idx}>
              <line
                x1={20}
                y1={tick.y}
                x2={svgWidth - 20}
                y2={tick.y}
                stroke="currentColor"
                strokeOpacity="0.08"
                strokeDasharray="4 4"
              />
              <text
                x={25}
                y={tick.y - 6}
                fill="currentColor"
                fillOpacity="0.45"
                fontSize="10"
                fontFamily="inherit"
              >
                {tick.label}
              </text>
            </g>
          ))}

          {/* Area fill */}
          <path d={areaD} fill="url(#trendOrangeGradient)" />

          {/* Line stroke */}
          <path
            d={pathD}
            fill="none"
            stroke="#f38218"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Interactive points & guide lines */}
          {points.map((p, idx) => {
            const isHovered = hoveredIndex === idx;
            return (
              <g
                key={idx}
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
                className="cursor-pointer"
              >
                {/* Hit area */}
                <circle cx={p.x} cy={p.y} r="14" fill="transparent" />

                {/* Vertical marker line on hover */}
                {isHovered && (
                  <line
                    x1={p.x}
                    y1={paddingTop}
                    x2={p.x}
                    y2={floorY}
                    stroke="#f38218"
                    strokeWidth="1.5"
                    strokeDasharray="3 3"
                    strokeOpacity="0.6"
                  />
                )}

                {/* Visible node */}
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={isHovered ? "6" : "3.5"}
                  fill="#ffffff"
                  stroke="#f38218"
                  strokeWidth={isHovered ? "3" : "2"}
                  className="transition-all duration-150"
                />
              </g>
            );
          })}

          {/* X-axis labels: first, middle, last */}
          {data.length > 0 && (
            <g>
              <text
                x={points[0].x}
                y={svgHeight - 10}
                textAnchor="start"
                fill="currentColor"
                fillOpacity="0.5"
                fontSize="11"
              >
                {data[0].label}
              </text>
              {data.length > 2 && (
                <text
                  x={points[Math.floor(data.length / 2)].x}
                  y={svgHeight - 10}
                  textAnchor="middle"
                  fill="currentColor"
                  fillOpacity="0.5"
                  fontSize="11"
                >
                  {data[Math.floor(data.length / 2)].label}
                </text>
              )}
              {data.length > 1 && (
                <text
                  x={points[points.length - 1].x}
                  y={svgHeight - 10}
                  textAnchor="end"
                  fill="currentColor"
                  fillOpacity="0.5"
                  fontSize="11"
                >
                  {data[data.length - 1].label}
                </text>
              )}
            </g>
          )}
        </svg>
      </div>
    </div>
  );
}

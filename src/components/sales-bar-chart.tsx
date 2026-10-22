"use client";

import { useId } from "react";
import {
  formatDate,
  formatDay,
  formatRupiah,
  formatWeekday,
} from "@/lib/format";

export type ChartPoint = {
  date: string;
  value: number;
};

function tickIndexes(count: number, limit: number) {
  if (count <= limit) {
    return Array.from({ length: count }, (_, index) => index);
  }

  const indexes = new Set<number>();

  for (let tick = 0; tick < limit; tick += 1) {
    indexes.add(Math.round((tick * (count - 1)) / (limit - 1)));
  }

  return [...indexes];
}

function tickLabel(point: ChartPoint) {
  return `${formatWeekday(point.date)} ${formatDay(point.date).split(" ")[0]}`;
}

function tickPosition(index: number, count: number) {
  if (count === 1) {
    return "50%";
  }

  if (index === 0) {
    return "0%";
  }

  if (index === count - 1) {
    return "100%";
  }

  return `${((index + 0.5) / count) * 100}%`;
}

function tickAlignment(index: number, count: number) {
  if (count === 1) {
    return "-translate-x-1/2";
  }

  if (index === 0) {
    return "";
  }

  if (index === count - 1) {
    return "-translate-x-full";
  }

  return "-translate-x-1/2";
}

export function SalesBarChart({
  points,
  title,
  totalLabel,
}: {
  points: ChartPoint[];
  title: string;
  totalLabel?: string;
}) {
  const titleId = useId();
  const total = points.reduce((sum, point) => sum + point.value, 0);
  const max = Math.max(...points.map((point) => point.value), 1);
  const peak = points.reduce(
    (highest, point) => (point.value > highest.value ? point : highest),
    { date: "", value: 0 },
  );
  const mobileTicks = tickIndexes(points.length, 4);
  const desktopTicks = tickIndexes(points.length, 7);

  return (
    <figure aria-labelledby={titleId}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <figcaption
            id={titleId}
            className="font-heading text-lg font-semibold tracking-[-0.01em] text-ink"
          >
            {title}
          </figcaption>
          <p className="mt-1 text-sm text-muted">
            {totalLabel ?? `Total ${formatRupiah(total)}`}
          </p>
        </div>
        {peak.value > 0 ? (
          <div className="text-right">
            <p className="text-xs text-muted">Penjualan tertinggi</p>
            <p className="mt-0.5 font-mono text-sm font-medium text-ink">
              {formatRupiah(peak.value)}
            </p>
          </div>
        ) : null}
      </div>

      <div
        role="img"
        aria-label={`Grafik ${title.toLowerCase()}. Total ${formatRupiah(total)}.`}
        className="mt-6 flex h-40 items-end gap-1.5 border-b border-line pb-px sm:gap-2"
      >
        {points.map((point) => {
          const height = Math.max((point.value / max) * 100, point.value > 0 ? 4 : 1);

          return (
            <div
              key={point.date}
              className="group relative flex h-full flex-1 items-end"
              title={`${formatDate(point.date)}: ${formatRupiah(point.value)}`}
            >
              <div
                className={`w-full rounded-t-[3px] transition-colors ${
                  point.value > 0
                    ? "bg-clay group-hover:bg-clay-dark"
                    : "bg-line-strong"
                }`}
                style={{ height: `${height}%` }}
              />
            </div>
          );
        })}
      </div>

      <div className="relative mt-2 h-4" aria-hidden="true">
        {mobileTicks.map((index) => (
          <span
            key={`mobile-${points[index].date}`}
            className={`absolute top-0 whitespace-nowrap font-mono text-[0.6rem] text-muted sm:hidden ${tickAlignment(index, points.length)}`}
            style={{ left: tickPosition(index, points.length) }}
          >
            {tickLabel(points[index])}
          </span>
        ))}
        {desktopTicks.map((index) => (
          <span
            key={`desktop-${points[index].date}`}
            className={`absolute top-0 hidden whitespace-nowrap font-mono text-[0.6rem] text-muted sm:block ${tickAlignment(index, points.length)}`}
            style={{ left: tickPosition(index, points.length) }}
          >
            {tickLabel(points[index])}
          </span>
        ))}
      </div>

      <table className="sr-only">
        <caption>{title}</caption>
        <thead>
          <tr>
            <th scope="col">Tanggal</th>
            <th scope="col">Nilai penjualan</th>
          </tr>
        </thead>
        <tbody>
          {points.map((point) => (
            <tr key={point.date}>
              <th scope="row">{formatDate(point.date)}</th>
              <td>{formatRupiah(point.value)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}

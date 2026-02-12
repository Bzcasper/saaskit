// Copyright 2023-2025 Deno authors. All rights reserved. MIT license.
import Chart from "@/islands/Chart.tsx";
import Head from "@/components/Head.tsx";
import TabsBar from "@/components/TabsBar.tsx";
import { defineRoute } from "$fresh/server.ts";
import { Partial } from "$fresh/runtime.ts";
import IconRadar from "@preact-icons/tb/TbRadar";
import { SITE_NAME, SITE_TAGLINE } from "@/utils/constants.ts";

function randomNumbers(length: number) {
  return Array.from({ length }, () => Math.floor(Math.random() * 1000));
}

export default defineRoute((_req, ctx) => {
  const labels = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];
  const datasets = [
    {
      label: "Site visits",
      data: randomNumbers(labels.length),
      borderColor: "#8B5CF6",
      backgroundColor: "rgba(139, 92, 246, 0.1)",
    },
    {
      label: "Users created",
      data: randomNumbers(labels.length),
      borderColor: "#06B6D4",
      backgroundColor: "rgba(6, 182, 212, 0.1)",
    },
    {
      label: "Items created",
      data: randomNumbers(labels.length),
      borderColor: "#EC4899",
      backgroundColor: "rgba(236, 72, 153, 0.1)",
    },
    {
      label: "Votes",
      data: randomNumbers(labels.length),
      borderColor: "#14B8A6",
      backgroundColor: "rgba(20, 184, 166, 0.1)",
    },
  ];

  return (
    <>
      <Head title="Dashboard" href={ctx.url.href} />
      <main class="flex-1 section-padding bg-grid-pattern">
        <div class="container-max">
          {/* Brand Header */}
          <div class="flex items-center gap-4 mb-12">
            <div class="w-12 h-12 rounded-lg bg-gradient-logo flex items-center justify-center shadow-glow">
              <IconRadar class="size-6 text-black" />
            </div>
            <div>
              <h1 class="font-heading font-black text-h2 gradient-text">
                Dashboard
              </h1>
              <p class="text-h5 font-heading text-primary-300 mt-2">
                "{SITE_TAGLINE}"
              </p>
            </div>
          </div>

          <TabsBar
            links={[{
              path: "/dashboard/stats",
              innerText: "Stats",
            }, {
              path: "/dashboard/users",
              innerText: "Users",
            }]}
            currentPath={ctx.url.pathname}
          />

          <Partial name="stats">
            <div class="card p-8 flex-1 relative min-h-[400px]">
              <Chart
                type="line"
                options={{
                  maintainAspectRatio: false,
                  interaction: {
                    intersect: false,
                    mode: "index",
                  },
                  plugins: {
                    legend: {
                      labels: {
                        color: "#F8FAFC",
                        font: {
                          family: "'DM Sans', sans-serif",
                        },
                      },
                    },
                  },
                  scales: {
                    x: {
                      grid: {
                        color: "rgba(139, 92, 246, 0.1)",
                      },
                      ticks: {
                        color: "#94A3B8",
                        font: {
                          family: "'DM Sans', sans-serif",
                        },
                      },
                    },
                    y: {
                      beginAtZero: true,
                      grid: {
                        color: "rgba(139, 92, 246, 0.1)",
                      },
                      ticks: {
                        precision: 0,
                        color: "#94A3B8",
                        font: {
                          family: "'DM Sans', sans-serif",
                        },
                      },
                    },
                  },
                }}
                data={{
                  labels,
                  datasets: datasets.map((dataset) => ({
                    ...dataset,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    pointBackgroundColor: dataset.borderColor,
                    pointBorderColor: "#0F172A",
                    pointBorderWidth: 2,
                    cubicInterpolationMode: "monotone",
                    tension: 0.4,
                  })),
                }}
              />
            </div>
          </Partial>
        </div>
      </main>
    </>
  );
});

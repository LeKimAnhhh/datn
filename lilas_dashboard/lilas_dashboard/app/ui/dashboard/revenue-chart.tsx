'use client';
import NoData from '@/app/components/NoData';
import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface RevenueChartProps {
  revenueData: Record<string, number>;
  type?: "day" | "hour",
}

export default function RevenueChart({ revenueData, type = "day" }: RevenueChartProps) {
  const [revenue, setRevenue] = useState<{ date: string; revenue: number; originalRevenue: number }[]>([]);
  const [barSize, setBarSize] = useState(40);

  useEffect(() => {
    if (revenueData) {
      const formattedData = Object.entries(revenueData).map(
        ([date, revenue]) => ({
          date:
            type === "day"
              ? new Date(date).toLocaleDateString("vi-VN", {
                  day: "2-digit",
                  month: "2-digit",
                })
              : date,
          originalRevenue: revenue,
          revenue,
        })
      );

      const totalRevenue = formattedData.reduce((sum, item) => sum + item.revenue, 0);

      const percentageData = formattedData.map(item => ({
        date: item.date,
        revenue: totalRevenue ? (item.revenue / totalRevenue) * 100 : 0, 
        originalRevenue: item.originalRevenue, 
      }));

      const totalWidth = 900;
      const calculatedBarSize = totalWidth / percentageData.length - 10;
      setBarSize(calculatedBarSize > 20 ? calculatedBarSize : 20);

      setRevenue(percentageData);
    }
  }, [revenueData, type]);

  
  if (!revenue || revenue.length === 0) {
    return (
      <div className="w-full md:col-span-3">
        <div className="bg-white rounded-2xl p-6 shadow-[0_2px_0_#D9D9D9] border boder-[#DFDCE0] h-full">
          <h2 className="text-xl font-semibold">Doanh thu bán hàng</h2>
          <NoData className="h-full"/>;
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="bg-white rounded-2xl p-6 shadow-[0_2px_0_#D9D9D9] border border-[#DFDCE0]">
        <h2 className="text-xl font-semibold mb-6">Doanh thu bán hàng</h2>
        <div className="w-full" style={{ height: 350 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={revenue}
              margin={{ top: 10, right: 20, left: 0, bottom: 10 }}
              barSize={barSize} 
            >
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              {/* <YAxis domain={[0, 100]} tickFormatter={(tick) => `${tick}%`} /> */}
              <Tooltip
                formatter={(value, name, props) => [
                  `${props.payload.originalRevenue.toLocaleString()} VND`, 
                  "Doanh thu",
                ]}
                // labelFormatter={(label) => `Ngày ${label}`}
              />
              <Bar dataKey="revenue" fill="#7683f1" radius={[5, 5, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
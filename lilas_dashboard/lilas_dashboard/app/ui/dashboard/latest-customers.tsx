'use client';
import NoData from '@/app/components/NoData';
import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

interface LatestCustomersProps {
  branchData: Record<string, number>; // Dữ liệu phần trăm từ API
}

export default function LatestCustomers({ branchData }: LatestCustomersProps) {
  if (!branchData || Object.keys(branchData).length === 0) {
    return (
      <div className="flex w-full flex-col xl:w-[38.5%]">
        <div className="flex flex-col bg-white rounded-2xl h-full shadow-[0_2px_0_#D9D9D9] border boder-[#DFDCE0]">
          <h2 className="pt-6 px-6 text-xl font-semibold">Tỷ trọng bán hàng</h2>
          <NoData className='h-full'/>
        </div>
      </div>
    );
  }

  // Convert data to array format for PieChart
  const total = Object.values(branchData).reduce((sum, val) => sum + val, 0);

  const pieData = Object.entries(branchData).map(([name, value]) => ({
    name,
    value,
    percentage: total ? ((value / total) * 100).toFixed(2) : "0",
  }));

  // Colors for the pie slices
  const colors = ['#8884d8', '#A3ABF2', '#82ca9d', '#FFBB28', '#FF8042'];

  return (
    <div className="flex w-full flex-col xl:w-[38.5%]">
      <div className="bg-white rounded-2xl h-full shadow-[0_2px_0_#D9D9D9] border border-[#DFDCE0]">
        <h2 className="p-6 text-xl font-semibold">Tỷ trọng bán hàng</h2>
        <div className="flex flex-col items-center py-1">
          {/* Legend Above Chart */}
          <div className="flex items-center justify-center mb-4 space-x-4">
            {pieData.map((entry, index) => (
              <div key={`legend-${index}`} className="flex items-center space-x-2">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: colors[index % colors.length] }}
                ></div>
                <p className="text-sm font-medium text-gray-600">{entry.name}</p>
              </div>
            ))}
          </div>

          {/* Donut Chart */}
          <PieChart width={400} height={300}>
            <Pie
              data={pieData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={90}
              outerRadius={120} 
              label={false}
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} className="outline-none"/>
              ))}
            </Pie>

            {/* Tooltip to show % on hover */}
            <Tooltip
              formatter={(value, name, props) => [`${props.payload.percentage}%`, name]}
            />
          </PieChart>
        </div>
      </div>
    </div>
  );
}
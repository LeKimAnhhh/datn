'use client';

import React, { useState, useEffect } from 'react';
import RevenueChart from '@/app/ui/dashboard/revenue-chart';
import LatestCustomers from '@/app/ui/dashboard/latest-customers';
import Inventory from '@/app/ui/dashboard/inventory';
import Latest from '@/app/ui/dashboard/table-latest';
import CardWrapper from '@/app/ui/dashboard/cards';
import { Suspense } from 'react';
import { RevenueChartSkeleton, CardsSkeleton } from '@/app/ui/skeletons';
import ProtectedRoute from '@/app/components/ProtectedRoute';
import SelectButton from '@/app/ui/select-button';
import { fetchRevenueSummary , fetchTotalInventoryValue} from "@/app/lib/data";
import ErrorPage from '../404/page';

export default function Page() {
  const [days, setDays] = useState(1);
  const [token, setToken] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);
  const [dataInventory, setDataInventory] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setToken(localStorage.getItem("access_token") || "");
    }
  }, []);

  useEffect(() => {
    async function loadData() {
      if (token) {
        setLoading(true);
        try {
          const result = await fetchRevenueSummary(token, days);
          console.log("🚀 ~ loadData ~ result:", result);
          const resultInventory = await fetchTotalInventoryValue();
          setData(result);
          setDataInventory(resultInventory);
        } catch (error:any) {
          console.error("Lỗi khi tải dữ liệu:", error);
          setError(error.message || "Lỗi khi tải dữ liệu");
        } finally {
          setLoading(false);
        }
      }
    }
    if (token) {
      loadData();
    }
  }, [days, token]);

  if (loading) {
    return <p className="mt-4 text-gray-400">Đang tải dữ liệu...</p>;
  }
  // if (!data) {
  //   return <p className="mt-4 text-gray-400">Không có dữ liệu.</p>;
  // }

  if (!data || error) {
    return <ErrorPage />;
  }

  return (
    <ProtectedRoute>
      <main className='grid grid-cols-1 gap-6 p-4'>
        <div className="flex w-full items-center justify-between mb-4">
          <h1 className="text-xl md:text-2xl font-semibold flex justify-between items-center mt-1">
            Tổng quan
          </h1>      
          <SelectButton onSelect={setDays} selectedDays={days} />  
        </div>

        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          <Suspense fallback={<CardsSkeleton />}>
            {data && (
              <CardWrapper 
                totalCustomers={data.total_customers || 0} 
                totalInvoices={data.total_invoices || 0} 
                totalPayments={data.total_payment || 0} 
                waitForPayment={data.wait_for_payment || 0} 
              />
            )}
          </Suspense>
        </div>
        
        <div className="flex flex-col xl:flex-row gap-6">
          <Suspense fallback={<RevenueChartSkeleton />}>
            {data.revenue_breakdown && <RevenueChart revenueData={data.revenue_breakdown} type={days === 1 ? "hour" : "day"} />}
          </Suspense>
          {data.branch_percentage && <LatestCustomers branchData={data.branch_percentage} />}
        </div>

        <div className="grid grid-cols-1">
        <Suspense fallback={<RevenueChartSkeleton />}>
            {dataInventory && <Inventory inventoryData={dataInventory} />}
        </Suspense>
        </div>

        <div className="grid grid-cols-1">
          <Latest />
        </div>
      </main>
    </ProtectedRoute>
  );
}
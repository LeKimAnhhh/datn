'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import Pagination from '@/app/ui/pagination';
import Search from '@/app/ui/search';
import TableCustomer from '@/app/ui/customer/table';
import CreateCustomerButton from '@/app/ui/customer/buttons';
import RowsPerPage from '@/app/ui/rows-page';
import { InvoicesTableSkeleton } from '@/app/ui/skeletons';
import { Customer } from '@/app/lib/definitions';
import { fetchCustomersData } from '@/app/lib/data';
import ErrorPage from '../404/page';

export default function Page() {
  const searchParams = useSearchParams();
  const query = searchParams.get('query') || '';

  // const pathname = usePathname();
  // const { replace } = useRouter();

  const currentPage = Number(searchParams.get('page')) || 1;
  const rowsPerPage = Number(searchParams.get('rowsPerPage')) || 10;

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [totalCustomers, setTotalCustomers] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // const [customerGroup, setCustomerGroup] = useState<string>('all');

  // const handleSearch = (term: string) => {
  //   if(term === 'all') return replace(`${pathname}`);
  //   console.log(`Searching... ${term}`);

  //   const params = new URLSearchParams(searchParams);
  //   params.set('page', '1');
  //   if (term) {
  //     params.set('query', term);
  //   } else {
  //     params.delete('query');
  //   }
  //   replace(`${pathname}?${params.toString()}`);
  // };

  // const handleCustomerGroupSelect = (value: string) => {
  //   setCustomerGroup(value);
  //   handleSearch(value);
  // };

  // useEffect(() => {
  //   async function loadCustomers() {
  //     try {
  //       setLoading(true);
  //       setError(null);

  //       const token = localStorage.getItem('access_token');
  //       if (!token) {
  //         setError('No access token found');
  //         setLoading(false);
  //         return;
  //       }

  //       const data = await fetchCustomersData(token, rowsPerPage, currentPage, query);
  //       setCustomers(data.customers);
  //       setTotalCustomers(data.total_customers);
  //     } catch (err: any) {
  //       console.error('Error fetching customer data:', err);
  //       setError(err.message || 'Error fetching customer data');
  //     } finally {
  //       setLoading(false);
  //     }
  //   }
  //   loadCustomers();
  // }, [rowsPerPage, currentPage, query]);


  const loadCustomers = useCallback(async () => {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem("access_token") || "";
    try {
      const data = await fetchCustomersData(token, rowsPerPage, currentPage, query);
      setCustomers(data.customers);
      setTotalCustomers(data.total_customers);
    } catch (err: any) {
      console.error('Error fetching customer data:', err);
      setError(err.message || 'Error fetching customer data');
    } finally {
      setLoading(false);
    }
  }, [rowsPerPage, currentPage, query]);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  const totalPages = Math.ceil(totalCustomers / rowsPerPage);

  if (error) {
    return <ErrorPage />;
  }

  return (
    <div className="w-full">
      <div className="flex w-full items-center justify-between">
        <h1 className="text-2xl font-semibold">Danh sách khách hàng</h1>
        <CreateCustomerButton reloadCustomers={loadCustomers} />
      </div>
      <div className="bg-white p-6 rounded-2xl mt-6 border boder-[#DFDCE0] shadow-[0_2px_0_#D9D9D9]">
        <div className="flex items-center justify-between gap-2 mb-6">
          <Search placeholder="Tìm kiếm theo tên khách hàng, số điện thoại..." />
        </div>

        {/* Nhóm khách hàng  */}
        {/* <div className="relative inline-block mb-6 mr-4">
          <Select
            options={[
              { value: "all", label: "Nhóm khách hàng" },
              { value: "lẻ", label: "Bán lẻ" },
              { value: "buôn", label: "Bán buôn" },
            ]}
            onSelect={handleCustomerGroupSelect}
            defaultValue={customerGroup}
            btnClassName="!bg-[#6464963D] !text-black"
          />
        </div> */}

        {loading && <InvoicesTableSkeleton />}
        {/* {error && (
          <div className="mt-6 text-center text-red-500">
            <p>{error}</p>
          </div>
        )} */}

        {!loading && !error && <TableCustomer initialData={customers} />}

        <div className="mt-5 flex w-full justify-between">
          <RowsPerPage defaultValue={rowsPerPage} />
          <Pagination totalPages={totalPages} />
        </div>
      </div>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Pagination from '@/app/ui/pagination';
import Search from '@/app/ui/search';
import TableCustomerGroup from '@/app/ui/customer-group/table';
import CreateCustomerGroupButton from '@/app/ui/customer-group/button';
import RowsPerPage from '@/app/ui/rows-page';
import { InvoicesTableSkeleton } from '@/app/ui/skeletons';
import { CustomerGroup } from '@/app/lib/definitions';
import { fetchCustomerGroupsData } from '@/app/lib/data';
import ErrorPage from '../404/page';

export default function Page() {
  const searchParams = useSearchParams();
  const query = searchParams.get('query') || '';
  const currentPage = Number(searchParams.get('page')) || 1;
  const rowsPerPage = Number(searchParams.get('rowsPerPage')) || 10;

  const [groups, setGroups] = useState<CustomerGroup[]>([]);
  const [totalGroups, setTotalGroups] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadGroups() {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem('access_token');
        if (!token) {
          setError('No access token found');
          setLoading(false);
          return;
        }

        const data = await fetchCustomerGroupsData(token, rowsPerPage, currentPage, query);
        // => { total_groups, groups }
        setGroups(data.groups);
        setTotalGroups(data.total_groups);
      } catch (err: any) {
        console.error('Error fetching customer groups:', err);
        setError(err.message || 'Error fetching customer groups');
      } finally {
        setLoading(false);
      }
    }
    loadGroups();
  }, [rowsPerPage, currentPage, query]);

  const totalPages = Math.ceil(totalGroups / rowsPerPage);

  if (error) {
    return <ErrorPage />;
  }

  return (
    <div className="w-full">
      <div className="flex w-full items-center justify-between">
        <h1 className="text-2xl font-semibold">Nhóm khách hàng</h1>
        <CreateCustomerGroupButton />
      </div>
      <div className='bg-white p-6 rounded-2xl mt-6 border boder-[#DFDCE0] shadow-[0_2px_0_#D9D9D9]'>
        <div className="flex items-center justify-between gap-2 mb-6">
          <Search placeholder="Tìm kiếm theo tên nhóm khách hàng..." />
        </div>

        {loading && <InvoicesTableSkeleton />}
        {/* {error && (
          <div className="mt-6 text-center text-red-500">
            <p>{error}</p>
          </div>
        )} */}

        {!loading && !error && (
          <TableCustomerGroup initialData={groups} />
        )}

        <div className="mt-5 flex w-full justify-between">
          <RowsPerPage defaultValue={rowsPerPage} />
          <Pagination totalPages={totalPages} />
        </div>
      </div>
    </div>
  );
}

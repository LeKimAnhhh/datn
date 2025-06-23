'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

import Pagination from '@/app/ui/pagination';
import Search from '@/app/ui/search';
import TableAccount from '@/app/ui/account/table';
import CreateAccountButton from '@/app/ui/account/buttons';
import RowsPerPage from '@/app/ui/rows-page';
import { InvoicesTableSkeleton } from '@/app/ui/skeletons';
import { Account } from '@/app/lib/definitions';
import { fetchAccountsData } from '@/app/lib/data';
import ErrorPage from '../404/page';

export default function Page() {
  const searchParams = useSearchParams();
  const query = searchParams.get('query') || '';
  const currentPage = Number(searchParams.get('page')) || 1;
  const rowsPerPage = Number(searchParams.get('rowsPerPage')) || 10;

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [totalAccounts, setTotalAccounts] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadAccounts() {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem('access_token');
        if (!token) {
          setError('No access token found');
          setLoading(false);
          return;
        }

        const data = await fetchAccountsData(token, rowsPerPage, currentPage, query);
        setAccounts(data.accounts);
        setTotalAccounts(data.total_accounts);
      } catch (err: any) {
        console.error('Error fetching accounts:', err);
        setError(err.message || 'Error fetching accounts');
      } finally {
        setLoading(false);
      }
    }

    loadAccounts();
  }, [rowsPerPage, currentPage, query]);

  const totalPages = Math.ceil(totalAccounts / rowsPerPage);

  if (error) {
    return <ErrorPage />;
  }

  return (
    <div className="w-full">
      <div className="flex w-full items-center justify-between">
        <h1 className="text-2xl font-semibold">Tài khoản bán hàng</h1>
        <CreateAccountButton />
      </div>
      <div className='bg-white p-6 rounded-2xl mt-6 border boder-[#DFDCE0] shadow-[0_2px_0_#D9D9D9]'>
        <div className="flex items-center justify-between gap-2 mb-6">
          <Search placeholder="Tìm kiếm theo tên đăng nhập, chức vụ..." />
        </div>

        {loading && <InvoicesTableSkeleton />}
        {/* {error && (
          <div className="mt-6 text-center text-red-500">
            <p>{error}</p>
          </div>
        )} */}

        {!loading && !error && (
          <TableAccount initialData={accounts} />
        )}

        <div className="mt-5 flex w-full justify-between">
          <RowsPerPage defaultValue={rowsPerPage} />
          <Pagination totalPages={totalPages} />
        </div>
      </div>
    </div>
  );
}

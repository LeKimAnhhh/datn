import { PencilIcon, PlusIcon } from '@heroicons/react/24/outline';
import LocalPrintshopOutlined from '@mui/icons-material/LocalPrintshopOutlined';
import Link from 'next/link';

export function CreateInvoice() {
  return (
    <Link
      href="/pos"
      className="flex h-10 items-center rounded-lg bg-[#338BFF] px-4 text-sm font-medium text-white transition-colors hover:bg-[#66B2FF] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#66B2FF]"
      target='_blank'
    >
      <PlusIcon className="h-5 md:mr-4" />
      <span className="hidden md:block">Tạo đơn hàng</span>{' '}
    </Link>
  );
}

export function UpdateInvoice({ id }: { id: string }) {
  return (
    <Link
      href={`/tong-quan/don-hang/${id}/edit`}
      className="rounded-md border p-2 hover:bg-gray-100"
    >
      <PencilIcon className="w-5" />
    </Link>
  );
}

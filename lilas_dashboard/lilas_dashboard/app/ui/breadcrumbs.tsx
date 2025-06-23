import Link from 'next/link';
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined';

interface Breadcrumb {
  label: string;
  href: string;
  active?: boolean;
}

export default function Breadcrumbs({
  breadcrumbs,
}: {
  breadcrumbs: Breadcrumb[];
}) {
  const previousPage = breadcrumbs.length > 1 ? breadcrumbs[breadcrumbs.length - 2] : null;
  const currentPage = breadcrumbs[breadcrumbs.length - 1];

  return (
    <nav aria-label="Breadcrumb" className="mb-6 flex items-center space-x-2">
      {previousPage && (
        <Link href={previousPage.href} className="flex items-center text-gray-500 hover:text-gray-700">
          <ArrowBackOutlinedIcon fontSize="medium" />
        </Link>
      )}
      {currentPage && (
        <span className="text-gray-900 text-xl md:text-2xl">{currentPage.label}</span>
      )}
    </nav>
  );
}

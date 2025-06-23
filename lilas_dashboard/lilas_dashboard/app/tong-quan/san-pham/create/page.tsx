import Breadcrumbs from '@/app/ui/breadcrumbs';
import CreateProductForm from '@/app/ui/product/create-form';
import { CreateProductGroupButton } from '@/app/ui/product/buttons';

export default async function Page() {
  return (
    <main className="px-0 2xl:px-32">
      <div className="flex items-center justify-between mb-4 h-10">
        <div className="flex items-center font-semibold">
          <Breadcrumbs
            breadcrumbs={[
              { label: 'Sản phẩm', href: '/tong-quan/san-pham' },
              {
                label: 'Tạo sản phẩm',
                href: '/tong-quan/san-pham/create',
                active: true,
              },
            ]}
          />
        </div>
        <div className="flex items-center mb-2 2xl:mb-6">
          <CreateProductGroupButton />
        </div>
      </div>
      <CreateProductForm />
    </main>
  );
}
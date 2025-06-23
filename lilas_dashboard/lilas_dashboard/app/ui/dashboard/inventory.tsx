export default function Inventory({ inventoryData }: { inventoryData: any }) { 
  return (
    <div className="flex w-full flex-col md:col-span-1">
      <div className="min-h-[143px] bg-white p-6 max-lg-padding rounded-2xl shadow-[0_2px_0_#D9D9D9] border boder-[#DFDCE0]">
        <h1 className="text-xl font-semibold">
          Thông tin kho
        </h1>
        <div className="grid sm:grid-cols-1 lg:grid-cols-3 mt-3 text-[17px] max-lg-text-sm">
          <div className="py-4 max-lg-py flex justify-between border-b lg:border-b-0 lg:border-r border-[#5C555E57]">
            <span>Tổng số mã sản phẩm</span>
            <span className="font-[700] lg:mr-[20px]">{inventoryData?.total_products.toLocaleString() || 0}</span>
          </div>
          <div className="py-4 max-lg-py lg:px-10 flex justify-between border-b lg:border-b-0 lg:border-r border-[#5C555E57]">
            <span>Tổng số tồn kho chi nhánh</span>
            <span className="font-[700]">{inventoryData?.total_stock.toLocaleString() || 0}</span>
          </div>
          <div className="py-4 max-lg-py flex justify-between">
            <span className="lg:ml-[20px]">Giá trị tồn kho chi nhánh</span>
            <span className="font-[700]">{inventoryData?.total_stock_value.toLocaleString() || 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
interface CardWrapperProps {
  totalCustomers: number;
  totalInvoices: number;
  totalPayments: number;
  waitForPayment: number;
}

export default function CardWrapper({
  totalCustomers,
  totalInvoices,
  totalPayments,
  waitForPayment,
}: CardWrapperProps) {
  return (
    <>
      <Card title="Đã thanh toán" value={totalPayments} />
      <Card title="Chờ thanh toán" value={waitForPayment} />
      <Card title="Tổng hóa đơn" value={totalInvoices} />
      <Card title="Tổng khách hàng" value={totalCustomers} />
    </>
  );
}

export function Card({
  title,
  value,
}: {
  title: string;
  value: number | string;
}) {
  return (
    <div className="rounded-2xl py-6 max-lg-py bg-white shadow-[0_2px_0_#D9D9D9] border boder-[#DFDCE0]">
      <div className="flex px-6 max-lg-px pb-3 max-lg-pb">
        <h3 className="text-[17px] max-lg-text-sm leading-[22px] max-lg-leading-10">{title}</h3>
      </div>
      <p className="px-6 max-lg-px pt-3 max-lg-pt text-[32px] max-lg-text-xl font-semibold leading-[38px] max-lg-leading-14">{value.toLocaleString()}</p>
    </div>
  );
}
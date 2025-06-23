import LocalPrintshopOutlined from "@mui/icons-material/LocalPrintshopOutlined";
import React from "react";
import ReactDOMServer from "react-dom/server";
// import { InvoiceData, generateInvoiceHTML } from "./InvoiceTemplate";
import { Invoice, ShopResponse } from "@/app/lib/definitions";

interface PrintButtonInvoiceProps {
  invoice: Invoice;
  shop?: ShopResponse;
}

export function PrintButtonInvoice({ invoice, shop }: PrintButtonInvoiceProps) {
  //console.log(invoice);
  const handlePrint = () => {
    const iframe = document.createElement("iframe");
    iframe.style.position = "absolute";
    iframe.style.width = "0px";
    iframe.style.height = "0px";
    iframe.style.border = "none";

    document.body.appendChild(iframe);
    // const now = new Date();
    // const formattedDate = now.toLocaleDateString("vi-VN");

    // const invoiceData: InvoiceData = {
    //   orderNumber: "SON65112",
    //   date: "27-02-2025",
    //   customerName: "Annie Pham",
    //   customerPhone: "0907026696",
    //   customerAddress: "521 Hồng Bàng, P14, Q5 - TP Hồ Chí Minh",
    //   items: [
    //     {
    //       quantity: 1,
    //       name: "Phí giao hàng",
    //       price: "20,000",
    //       total: "20,000",
    //     },
    //     {
    //       quantity: 1,
    //       name: "Sữa rửa mặt mini GIVENCHY 15ml",
    //       price: "150,000",
    //       total: "150,000",
    //     },
    //     {
    //       quantity: 1,
    //       name: "Set mini GIVENCHY Essential Set",
    //       price: "950,000",
    //       total: "950,000",
    //     },
    //   ],
    //   subtotal: "1.120.000",
    //   discount: "0",
    //   total: "1.15435920.000",
    // };

    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (doc) {
      doc.open();
      doc.write(generateInvoiceHTML(invoice, shop));
      doc.close();

      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    }

    setTimeout(() => {
      document.body.removeChild(iframe);
    }, 1000);
  };

  return (
    <button
      //disabled={invoice.customer.id === "KH1"}
      onClick={handlePrint}
      className="bg-transparent text-[#0061FD] font-semibold py-0.5 px-2 rounded-md border border-[#0061FD] disabled:pointer-events-none disabled:opacity-50"
    >
      <LocalPrintshopOutlined className="w-5" />
      In đơn
    </button>
  );
}

interface InvoiceTemplateProps {
  invoice: Invoice;
  shop?: ShopResponse;
}

export function InvoiceTemplate({ invoice, shop }: InvoiceTemplateProps) {
  const customer_full_address = [
    invoice.customer.address,
    invoice.customer.ward_name,
    invoice.customer.district_name,
    invoice.customer.province,
  ]
    .filter((x) => x)
    .join(", ");

  const date = new Date(invoice.updated_at || new Date());
  const formattedDate = date.toLocaleDateString("vi-VN");

  return (
    <html lang="vi">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{`Chi tiết đơn hàng ${invoice.id} | POSX`}</title>
        <style>
          {`
            body {
                font-size: 8px;
                font-family: Arial;
                margin-left: 10px;
                margin-right: 10px;
            }

            .detail_cus{
                min-height: 5px;
            }

            table {
                width: 100%;
                border-collapse: collapse;
            }
            th, td {
                padding: 4px 2px 4px 2px;
                text-align: start;
                border-bottom: 0.5px dotted #ddd;
            }
                .footer {
                text-align: center;
                font-style: italic;
            }
            .cash_bill {
                display: flex;
                align-items: center;
                justify-content: space-between;
                height: 12px;
            }
            .product-name {
                max-width: 60%;
                word-wrap: break-word;
            }
            .quantity, .price, .total {
                white-space: nowrap;
                text-align: right;
            }
            th.price, th.total, th.quantity {
                text-align: right;
            }
            `}
        </style>
      </head>
      <body>
        <div className="invoice">
          <div
            style={{
              textAlign: "center",
            }}
          >
            <div>
              <h5 className="store-name">LILAS MAISON</h5>
              <p className="small_text">Paris in your bag!</p>
            </div>
            <p className="store-address">
              {shop?.address || invoice.branch}
            </p>
            <p className="store-phone">{shop?.phone || "---"}</p>
            <p>HÓA ĐƠN BÁN HÀNG</p>
            <p>Số: {invoice.id}</p>
            <p>Ngày: {formattedDate}</p>
          </div>

          <hr />

          <div className="info_cus">
            <div className="detail_cus">
              <p>
                Khách hàng: <strong>{invoice.customer.id === "KH1" ? "-" : invoice.customer.full_name}</strong>
              </p>
            </div>
            <div className="detail_cus">
              <p>
                Điện thoại: <strong>{invoice.customer.id === "KH1" ? "-" : invoice.customer.phone}</strong>
              </p>
            </div>
            <div className="detail_cus">
              <p>
                Địa chỉ: <strong>{customer_full_address}</strong>
              </p>
            </div>
          </div>

          <hr />

          <table>
            <thead>
              <tr>
                <th>Sản phẩm</th>
                <th className="quantity">SL</th>
                <th className="price">Đơn giá</th>
                <th className="total">Thành tiền</th>
              </tr>
            </thead>
            <tbody>
              {invoice.service_items.map((item, index) => (
                <tr key={index}>
                  <td className="product-name">{!!item.name ? item.name : "Sản phẩm dịch vụ"}</td>
                  <td className="quantity">{item.quantity}</td>
                  <td className="price">{item.price.toLocaleString("en-US")}</td>
                  <td className="total">
                    {(item.price * item.quantity).toLocaleString("en-US")}
                  </td>
                </tr>
              ))}

              {invoice.items.map((item, index) => (
                <tr key={index}>
                  <td className="product-name">{item.product?.name}</td>
                  <td className="quantity">{item.quantity}</td>
                  <td className="price">{item.price.toLocaleString("en-US")}</td>
                  <td className="total">
                    {(item.price * item.quantity).toLocaleString("en-US")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <hr />

          <div className="info_cash">
            <div className="cash_bill">
              <p>Cộng tiền hàng:</p>
              <p>
                {(
                  invoice.items.reduce(
                    (acc, item) => acc + item.price * item.quantity,
                    0
                  ) +
                  invoice.service_items.reduce(
                    (acc, item) => acc + item.price * item.quantity,
                    0
                  )
                ).toLocaleString("en-US")}
              </p>
            </div>
            <div className="cash_bill">
              <p>Thêm chi phí:</p>
              <p>{invoice.extraCost?.toLocaleString("en-US") || 0}</p>
            </div>
            <div className="cash_bill">
              <p>Chiết khấu:</p>
              <p>
                {invoice.discount_type === "%"
                  ? `${invoice.discount}%`
                  : invoice.discount.toLocaleString("en-US")}
              </p>
            </div>
            <div className="cash_bill">
              <p>Đã cọc:</p>
              <p>
                {invoice.deposit.toLocaleString("en-US")}
              </p>
            </div>
            <div className="cash_bill">
              <p>Khách phải trả:</p>
              <p>{(invoice.total_value + (invoice.extraCost || 0) - invoice.deposit).toLocaleString("en-US")}</p>
            </div>
          </div>
          <p className="footer">Cảm ơn quý khách. Hẹn gặp lại!</p>
        </div>
      </body>
    </html>
  );
}

export function generateInvoiceHTML(invoice: Invoice, shop?: ShopResponse): string {
  const invoiceComponent = <InvoiceTemplate invoice={invoice} shop={shop} />;
  const htmlString = ReactDOMServer.renderToString(invoiceComponent);

  return `<!DOCTYPE html>${htmlString}`;
}

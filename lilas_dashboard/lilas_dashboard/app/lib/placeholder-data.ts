const data = {
  revenue_per_period: {
    "2025-02-15": 32470000,
    "2025-02-16": 0,
    "2025-02-17": 0,
    "2025-02-18": 0,
    "2025-02-19": 0,
    "2025-02-20": 352990000,
    "2025-02-21": 32470000
  },
  total_deliveries_per_period: {
    "2025-02-15": 0,
    "2025-02-16": 0,
    "2025-02-17": 0,
    "2025-02-18": 0,
    "2025-02-19": 0,
    "2025-02-20": 3,
    "2025-02-21": 6
  },
  profit_per_period: {
    "2025-02-15": 0,
    "2025-02-16": 0,
    "2025-02-17": 0,
    "2025-02-18": 0,
    "2025-02-19": 0,
    "2025-02-20": 38890000,
    "2025-02-21": 16830000
  },
  top_product_per_period: [
    {
      product: "Bleu de Chanel",
      quantity: 100
    },
    {
      product: "Stronger With You",
      quantity: 26
    },
    {
      product: "Nước hoa",
      quantity: 12
    }
  ]
};

// Chuyển đổi revenue thành mảng dữ liệu có thể dùng trong biểu đồ
export const deliverie = Object.entries(data.total_deliveries_per_period).map(([date, deliverie]) => ({
  date: new Date(date).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" }),
  deliverie
}));

// Chuyển đổi danh sách sản phẩm bán chạy thành dữ liệu biểu đồ tròn
export const genarateSellData = data.top_product_per_period;

// Chuyển đổi dữ liệu lợi nhuận theo tháng
export const generateMonthlyMockData = Object.keys(data.profit_per_period).map((date: string) => ({
  date: new Date(date).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" }),
  profit: (data.profit_per_period as Record<string, number>)[date] || 0, 
  revenue: (data.revenue_per_period as Record<string, number>)[date] || 0, 
}));

export const totalRevenuePerMonth = Object.entries(data.revenue_per_period).reduce((acc, [date, total]) => {
  const d = new Date(date);
  const monthKey = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, "0")}`;

  acc[monthKey] = (acc[monthKey] || 0) + total;
  return acc;
}, {} as Record<string, number>);
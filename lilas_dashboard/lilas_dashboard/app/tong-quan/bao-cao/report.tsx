"use client";
import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  Label,
} from "recharts";
// import {
//   deliverie,
//   genarateSellData,
//   generateMonthlyMockData,
//   totalRevenuePerMonth,
// } from "@/app/lib/placeholder-data";
import Image from "next/image";
import { fetchTopRevenue } from "@/app/lib/data";
import SelectButton from "@/app/ui/select-button";
import ErrorPage from "../404/page";
import NoData from "@/app/components/NoData";
// import { RevenueSummary } from "@/app/lib/definitions";

// const transportData = deliverie;
// const doanhthu = generateMonthlyMockData;

// const sellData = genarateSellData;

// const tongDoanhthu = totalRevenuePerMonth;
const COLORS = ["#7683F1", "#5E46BC", "#C877F1", "#F177DF", "#F17777", "#F1B077", "#DDF177", "#86E286", "#86E2E2", "#76B3F1"];

const AboutPage = () => {
  const [token, setToken] = useState<string | null>(null);

  const [transportDay, setTransportDay] = useState(1);
  const [revenueDay, setRevenueDay] = useState(1);
  const [topProductDay, setTopProductDay] = useState(1);

  const [transportData, setTransportData] = useState<any>();
  const [revenueData, setRevenueData] = useState<any>();
  const [topProductData, setTopProductData] =
    useState<{ product: string; quantity: number }[]>();

  const [error, setError] = useState<string | null>(null);

  // const [filteredDayData, setFilteredDayData] = useState(
  //   transportData.slice(transportData.length - 7)
  // );
  // const [filteredDay1Data, setFilteredDay1Data] = useState(
  //   doanhthu.slice(doanhthu.length - 7)
  // );

  const handleSelectTransportDay = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const days = parseInt(e.target.value, 10);
    setTransportDay(days);
    //setFilteredDayData(transportData.slice(transportData.length - days));
  };
  const handleSelectRevenueDay = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const day1s = parseInt(e.target.value, 10);
    setRevenueDay(day1s);
    //setFilteredDay1Data(doanhthu.slice(doanhthu.length - day1s));
  };

  const handleSelectTopProductDay = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const period = parseInt(e.target.value, 10);
    setTopProductDay(period);
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      setToken(localStorage.getItem("access_token") || "");
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (token) {
          const { total_deliveries_per_period } = await fetchTopRevenue(
            token,
            transportDay
          );
          console.log("raw data", total_deliveries_per_period);
          if (transportDay === 1) {
            setTransportData(convertDeliverieData(total_deliveries_per_period, "hour"));
          }
          else {
            setTransportData(convertDeliverieData(total_deliveries_per_period));
          }
        }
      } catch (err:any) {
        console.error("Error fetching deliveries:", err);
        setError(err.message || "Error fetching deliveries");
      }
    };
    fetchData();
  }, [token, transportDay]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (token) {
          const { revenue_per_period, profit_per_period } = await fetchTopRevenue(
            token,
            revenueDay
          );
          console.log(convertRevenueData(profit_per_period, revenue_per_period));
          if (revenueDay === 1) {
            setRevenueData(
              convertRevenueData(profit_per_period, revenue_per_period, "hour")
            )
          } else {
            setRevenueData(
              convertRevenueData(profit_per_period, revenue_per_period)
            )
          }
        }
      } catch (err:any) {
        console.error("Error fetching revenue data:", err);
        setError(err.message || "Error fetching revenue data");
      }
    };
    fetchData();
  }, [token, revenueDay]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (token) {
          const { top_product_per_period } = await fetchTopRevenue(
            token,
            topProductDay
          );
          console.log(top_product_per_period);
          setTopProductData(top_product_per_period);
        }
      } catch (err: any) {
        console.error("Error fetching top product data:", err);
        setError(err.message || "Error fetching top product data");
      }
    };
    fetchData();
  }, [token, topProductDay]);

  if (error) {
    return <ErrorPage />;
  }
  
  return (
    <div className="w-full max-h-none overflow-hidden">
      <div className="h-[56px]">
        <a className="pb-6 text-2xl font-semibold">Báo cáo</a>
      </div>
      <div className="flex flex-col gap-8 h-full">
        <div className="flex flex-col 1.5xl:flex-row gap-8 1.5xl:gap-6 h-auto 1.5xl:h-[453px]">
          <div className="h-full bg-white p-6 w-full 1.5xl:w-2/3 rounded-2xl border-[#DFDCE0]">
            <div className="flex justify-between items-center">
              <span className="font-sf font-[590] text-[20px] leading-[25px] tracking-[0]">
                Chỉ số vận chuyển
              </span>
              {/* <select
                className="w-[137px] text-sm h-[38px] font-semibold pl-2 bg-[#6464963D] text-black border border-gray-300 rounded-md"
                value={transportDay}
                onChange={handleSelectTransportDay}
              >
                <option value={7}>7 ngày</option>
                <option value={30}>30 ngày</option>
                <option value={365}>1 năm</option>
              </select> */}
              <SelectButton
                onSelect={setTransportDay}
                selectedDays={transportDay}
                btnClassName="!bg-[#6464963D] !text-black font-semibold"
              />
            </div>
            <div className="h-[353px] mt-[14px]">
              {/* {filteredDayData.length > 0 &&
              filteredDayData.some((item) => item.deliverie > 0) ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={filteredDayData}>
                    <XAxis dataKey="date" />
                    <YAxis tickCount={6} width={53} />
                    <Tooltip />
                    <Bar
                      dataKey="deliverie"
                      name="Số đơn"
                      fill="#8884d8"
                      barSize={120}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex flex-col items-center justify-center flex-1 text-[#A08DA5]">
                  <Image
                    src="/not_found.svg"
                    alt="Empty state"
                    width={85}
                    height={65}
                    className="w-auto h-auto"
                  />
                  <p className="text-center text-gray-500 text-lg">
                    Không có dữ liệu
                  </p>
                </div>
              )} */}
              {!!transportData && (
                <DeliverieChart data={transportData} day={transportDay} />
              )}
            </div>
          </div>
          <div className="w-full 1.5xl:w-1/3 bg-white text-black p-6 rounded-2xl border-[#DFDCE0]">
            <div className="flex justify-between items-center">
              <span className="font-sf font-[590] text-[20px] leading-[25px] tracking-[0]">
                Top sản phẩm
              </span>

              <SelectButton
                onSelect={setTopProductDay}
                selectedDays={topProductDay}
                btnClassName="!bg-[#6464963D] !text-black font-semibold"
              />
            </div>

            <div className="flex justify-center items-center mt-[14px] h-[348px]">
              {/* {sellData.length > 0 &&
              sellData.some((item) => item.quantity > 0) ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={sellData}
                      dataKey="quantity"
                      nameKey="product"
                      outerRadius={110}
                      fill="#8884d8"
                      label={true}
                    >
                      {sellData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Legend
                      style={{
                        display: "flex",
                        width: "100%",
                        flexWrap: "wrap",
                        gap: "24px",
                        justifyContent: "space-evenly",
                        alignItems: "center",
                      }}
                      iconType="square"
                    />
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex flex-col items-center justify-center flex-1 text-[#A08DA5]">
                  <Image
                    src="/not_found.svg"
                    alt="Empty state"
                    width={85}
                    height={65}
                    className="w-auto h-auto"
                  />
                  <p className="text-center text-gray-500 text-lg">
                    Không có dữ liệu
                  </p>
                </div>
              )} */}

              {!!topProductData && <TopProductChart data={topProductData} />}
            </div>
          </div>
        </div>

        <div className="h-[509px] bg-white p-6 rounded-2xl border-[#DFDCE0]">
          <div className="flex justify-between items-center">
            <div>
              <div className="h-[25px]">
                <span className="font-sf font-[590] text-[20px] leading-[25px] tracking-[0] mb-4">
                  Doanh thu
                </span>
              </div>
              {/* <div className="h-[38px]">
                <span>
                  <a className="text-[32px] font-bold font-sf">0</a>
                  <a className="text-green-500 font-semibold"> + 0%</a>
                  <a> so với tháng trước </a>
                </span>
              </div> */}
            </div>
            <SelectButton
              onSelect={setRevenueDay}
              selectedDays={revenueDay}
              btnClassName="!bg-[#6464963D] !text-black font-semibold"
            />
            {/* <select
              className="w-[121px] h-[38px] text-sm pl-2 bg-[#6464963D] font-semibold text-black border border-gray-300 rounded-md"
              value={revenueDay}
              onChange={handleSelectRevenueDay}
            >
              <option value={7}>7 ngày</option>
              <option value={30}>30 ngày</option>
              <option value={365}>1 năm</option>
            </select> */}
          </div>
          <div className="h-[366px] w-full mt-6">
            {/* {filteredDay1Data.length > 0 &&
            filteredDay1Data.some(
              (item) => item.profit != 0 || item.revenue != 0
            ) ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={filteredDay1Data}>
                  <Legend
                    align="center"
                    display="flex"
                    verticalAlign="top"
                    fontSize="24px"
                  />
                  <XAxis dataKey="date" />
                  <YAxis
                    tickCount={5}
                    width={53}
                    tickFormatter={(value) =>
                      `${(value / 1_000_000).toFixed(1)}Tr`
                    }
                  />
                  <Tooltip />
                  <Bar
                    dataKey="profit"
                    name="Lợi nhuận"
                    fill="#7683F1"
                    barSize={120}
                  />
                  <Bar
                    dataKey="revenue"
                    name="Doanh thu"
                    fill="#99DA78"
                    barSize={120}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center flex-1 text-[#A08DA5] mt-[100px]">
                <Image
                  src="/not_found.svg"
                  alt="Empty state"
                  width={85}
                  height={65}
                  className="w-auto h-auto"
                />
                <p className="text-center text-gray-500 text-lg">
                  Không có dữ liệu
                </p>
              </div>
            )} */}

            {!!revenueData && (
              <RevenueChart data={revenueData} day={revenueDay} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

function convertDeliverieData(
  data: Record<string, number>,
  type: "day" | "hour" = "day"
) {
  if (type === "hour") {
    return Object.entries(data).map(([date, deliverie]) => ({
      date,
      deliverie,
    }));
  }
  return Object.entries(data).map(([date, deliverie]) => ({
    date: new Date(date).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
    }),
    deliverie,
  }));
}

function convertRevenueData(
  profit_data: Record<string, number>,
  revenue_data: Record<string, number>,
  type: "day" | "hour" = "day"
) {
  if (type === "hour") {
    return Object.keys(profit_data).map((date: string) => ({
      date,
      profit: profit_data[date] || 0,
      revenue: revenue_data[date] || 0,
    }));
  }

  return Object.keys(profit_data).map((date: string) => ({
    date: new Date(date).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
    }),
    profit: profit_data[date] || 0,
    revenue: revenue_data[date] || 0,
  }));
}

function DeliverieChart({ data, day }: { data: any; day?: number }) {
  if (data.length === 0) {
    return <NoData className="h-full"/>;
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <XAxis
          dataKey="date"
          tickFormatter={(value) => {
            if (day === 365) {
              return value.replace(
                /01-(\d{2})/g,
                (_: string, month: string) => `Tháng ${parseInt(month, 10)}`
              );
            }
            return value.replace("-", "/");
          }}
          tickMargin={5}
        />
        <YAxis tickCount={6} width={53} />
        <Tooltip
          formatter={(value) => value && value.toLocaleString("en-ES")}
        />
        <Bar dataKey="deliverie" name="Số đơn" fill="#76B3F1" barSize={120} />
      </BarChart>
    </ResponsiveContainer>
  );
}

function RevenueChart({ data, day }: { data: any; day?: number }) {
  if (data.length === 0) {
    return <NoData className="h-full"/>;
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <Legend
          align="center"
          display="flex"
          verticalAlign="top"
          fontSize="24px"
        />
        <XAxis
          dataKey="date"
          tickFormatter={(value) => {
            if (day === 365) {
              return value.replace(
                /01-(\d{2})/g,
                (_: string, month: string) => `Tháng ${parseInt(month, 10)}`
              );
            }
            return value.replace("-", "/");
          }}
          tickMargin={5}
        />
        <YAxis
          tickCount={5}
          width={53}
          tickFormatter={(value) => `${(value / 1_000_000).toFixed(1)}Tr`}
        />
        <Tooltip
          formatter={(value) => value && value.toLocaleString("en-ES")}
        />
        <Bar dataKey="profit" name="Lợi nhuận" fill="#76B3F1" barSize={120} />
        <Bar dataKey="revenue" name="Doanh thu" fill="#86E286" barSize={120} />
      </BarChart>
    </ResponsiveContainer>
  );
}

function TopProductChart({ data }: { data: any }) {
  const [windowWidth, setWindowWidth] = useState<number>(
    typeof window !== 'undefined' ? window.innerWidth : 0
  );
  
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    
    window.addEventListener('resize', handleResize);
    handleResize();
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (data.length === 0) {
    return <NoData className="h-full"/>;
  }
  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
    index,
  }: {
    cx: number;
    cy: number;
    midAngle: number;
    innerRadius: number;
    outerRadius: number;
    percent: number;
    index: number;
  }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  const top_7 = data.slice(0, 7);

  const CustomLegend = () => (
    <>
    {top_7.map((entry: any, index: any) => (
      <div key={index} className="flex flex-row gap-2 items-center">
        <span
          title={entry.product}
          className="inline-block w-5 h-5 shrink-0"
          style={{
            backgroundColor: COLORS[index % COLORS.length],
          }}
        />
        <span className="line-clamp-1 max-w-fit break-all" title={entry.product}>{entry.product}</span>
      </div>
    ))}
  </>
  );

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          dataKey="quantity"
          nameKey="product"
          outerRadius={110}
          fill="#8884d8"
          label={renderCustomizedLabel}
          labelLine={false}
        >
          {data.map((entry: any, index: any) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} className="outline-none"/>
          ))}
        </Pie>
        <Legend
          content={<CustomLegend />}
          align="right"
          verticalAlign="middle"
          layout="vertical"
          wrapperStyle={{
            // left: "270px",
            left: windowWidth >= 1440 ? "270px" : undefined,
            gap: "8px",
            display: "flex",
            flexDirection: "column",
          }}
        />
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  );
}

export default AboutPage;

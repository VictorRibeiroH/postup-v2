"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, MessageCircle, DollarSign, TrendingUp } from "lucide-react";
import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data7Days = [
  { day: "Seg", value: 2400 },
  { day: "Ter", value: 1398 },
  { day: "Qua", value: 9800 },
  { day: "Qui", value: 3908 },
  { day: "Sex", value: 4800 },
  { day: "Sáb", value: 3800 },
  { day: "Dom", value: 4300 },
];

const data30Days = [
  { day: "Sem 1", value: 12400 },
  { day: "Sem 2", value: 18398 },
  { day: "Sem 3", value: 15800 },
  { day: "Sem 4", value: 21908 },
];

const metrics = [
  {
    icon: TrendingUp,
    label: "Alcance Total",
    value: "45.2K",
    change: "+12.5%",
    color: "text-[#FF6400]",
  },
  {
    icon: Eye,
    label: "Views",
    value: "128.5K",
    change: "+8.3%",
    color: "text-blue-600",
  },
  {
    icon: MessageCircle,
    label: "Conversas Iniciadas",
    value: "1.2K",
    change: "+15.7%",
    color: "text-green-600",
  },
  {
    icon: DollarSign,
    label: "Valor Investido em Anúncio",
    value: "R$ 2.450",
    change: "-5.2%",
    color: "text-purple-600",
  },
];

export default function AnalyticsSection() {
  const [period, setPeriod] = useState<"7" | "30">("7");
  const chartData = period === "7" ? data7Days : data30Days;

  return (
    <section className="py-20 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center max-w-4xl mx-auto mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
            Análise em <span className="text-[#FF6400]">Tempo Real</span>
          </h2>
          <p className="text-xl text-gray-600 leading-relaxed">
            Acompanhe o desempenho das suas campanhas com dados precisos e
            atualizados em tempo real.
          </p>
        </div>

        {/* Dashboard Card */}
        <Card className="backdrop-blur-xl bg-gradient-to-br from-white to-orange-50/30 border-gray-200/50 shadow-2xl">
          <CardContent className="p-8">
            {/* Metrics Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {metrics.map((metric, index) => (
                <div
                  key={index}
                  className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 hover:shadow-lg transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gray-100 ${metric.color}`}
                    >
                      <metric.icon className="w-6 h-6" />
                    </div>
                    <span
                      className={`text-sm font-semibold ${
                        metric.change.startsWith("+")
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {metric.change}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">{metric.label}</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {metric.value}
                  </p>
                </div>
              ))}
            </div>

            {/* Chart Section */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  Crescimento
                </h3>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={period === "7" ? "default" : "outline"}
                    onClick={() => setPeriod("7")}
                    className={
                      period === "7"
                        ? "bg-[#FF6400] hover:bg-[#e55a00]"
                        : ""
                    }
                  >
                    7 dias
                  </Button>
                  <Button
                    size="sm"
                    variant={period === "30" ? "default" : "outline"}
                    onClick={() => setPeriod("30")}
                    className={
                      period === "30"
                        ? "bg-[#FF6400] hover:bg-[#e55a00]"
                        : ""
                    }
                  >
                    30 dias
                  </Button>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="day" stroke="#666" />
                  <YAxis stroke="#666" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#FF6400"
                    strokeWidth={3}
                    dot={{ fill: "#FF6400", r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

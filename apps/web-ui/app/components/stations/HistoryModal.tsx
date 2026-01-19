import { useMemo } from 'react';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { Alert } from '../ui/Alert';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface HistoryValue {
  timestamp: string;
  value: string;
}

interface StationHistory {
  station: {
    name: string;
    usgsId: string;
    values: {
      flow?: HistoryValue[];
      gage?: HistoryValue[];
    };
  };
}

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  loading: boolean;
  error?: Error | null;
  data?: StationHistory | null;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  onClose,
  loading,
  error,
  data,
}) => {
  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) {
      return 'Invalid';
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatDateTime = (timestamp: string) => {
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) {
      return 'Invalid Date';
    }
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const chartData = useMemo(() => {
    if (!data?.station?.values) return [];

    const flowData = data.station.values.flow || [];
    const gageData = data.station.values.gage || [];

    const dataMap = new Map<
      string,
      { flow: number | null; gage: number | null; date: string; dateTime: string }
    >();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    flowData.forEach((item: any) => {
      if (!dataMap.has(item.timestamp)) {
        dataMap.set(item.timestamp, {
          flow: null,
          gage: null,
          date: formatDate(item.timestamp),
          dateTime: formatDateTime(item.timestamp),
        });
      }
      const value = parseFloat(item.value);
      dataMap.get(item.timestamp)!.flow = isNaN(value) ? null : value;
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    gageData.forEach((item: any) => {
      if (!dataMap.has(item.timestamp)) {
        dataMap.set(item.timestamp, {
          flow: null,
          gage: null,
          date: formatDate(item.timestamp),
          dateTime: formatDateTime(item.timestamp),
        });
      }
      const value = parseFloat(item.value);
      dataMap.get(item.timestamp)!.gage = isNaN(value) ? null : value;
    });

    return Array.from(dataMap.entries())
      .map(([timestamp, values]) => ({
        timestamp,
        ...values,
      }))
      .sort(
        (a, b) =>
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );
  }, [data]);

  const hasFlowData = chartData.some((d) => d.flow !== null);
  const hasGageData = chartData.some((d) => d.gage !== null);

  // Chart.js configuration for Flow Rate
  const flowChartData = {
    labels: chartData.map((d) => d.date),
    datasets: [
      {
        label: 'Flow Rate (cfs)',
        data: chartData.map((d) => d.flow),
        borderColor: '#fbbf24',
        backgroundColor: 'rgba(251, 191, 36, 0.1)',
        borderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: '#fbbf24',
        pointBorderColor: '#fbbf24',
        tension: 0.1,
        spanGaps: true,
      },
    ],
  };

  const flowChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        display: true,
        labels: {
          color: '#e5e7eb',
        },
      },
      tooltip: {
        backgroundColor: '#1e293b',
        titleColor: '#e5e7eb',
        bodyColor: '#e5e7eb',
        borderColor: '#10b981',
        borderWidth: 1,
        padding: 12,
        displayColors: true,
        callbacks: {
          title: (context) => {
            const index = context[0].dataIndex;
            return chartData[index]?.dateTime || '';
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          color: '#334155',
        },
        ticks: {
          color: '#94a3b8',
          font: {
            size: 12,
          },
        },
      },
      y: {
        beginAtZero: true,
        grace: '10%',
        grid: {
          color: '#334155',
        },
        ticks: {
          color: '#94a3b8',
          font: {
            size: 12,
          },
        },
      },
    },
  };

  // Chart.js configuration for Gage Height
  const gageChartData = {
    labels: chartData.map((d) => d.date),
    datasets: [
      {
        label: 'Gage Height (ft)',
        data: chartData.map((d) => d.gage),
        borderColor: '#06b6d4',
        backgroundColor: 'rgba(6, 182, 212, 0.1)',
        borderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: '#06b6d4',
        pointBorderColor: '#06b6d4',
        tension: 0.1,
        spanGaps: true,
      },
    ],
  };

  const gageChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        display: true,
        labels: {
          color: '#e5e7eb',
        },
      },
      tooltip: {
        backgroundColor: '#1e293b',
        titleColor: '#e5e7eb',
        bodyColor: '#e5e7eb',
        borderColor: '#10b981',
        borderWidth: 1,
        padding: 12,
        displayColors: true,
        callbacks: {
          title: (context) => {
            const index = context[0].dataIndex;
            return chartData[index]?.dateTime || '';
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          color: '#334155',
        },
        ticks: {
          color: '#94a3b8',
          font: {
            size: 12,
          },
        },
      },
      y: {
        beginAtZero: true,
        grace: '10%',
        grid: {
          color: '#334155',
        },
        ticks: {
          color: '#94a3b8',
          font: {
            size: 12,
          },
        },
      },
    },
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-70 p-4">
      <div className="relative w-full max-w-4xl rounded-lg bg-slate-800 border border-emerald-700/40 p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-stone-400 hover:text-stone-100 text-2xl font-bold"
          aria-label="Close"
        >
          &times;
        </button>
        {loading ? (
          <div className="flex justify-center items-center p-8">
            <LoadingSpinner size="lg" variant="dark" />
          </div>
        ) : error ? (
          <div className="p-4">
            <Alert
              variant="error"
              title="Error Loading History"
              message={`Could not load historical data for this station. ${error.message}`}
            />
          </div>
        ) : data?.station ? (
          <div>
            <h2 className="text-2xl font-bold text-stone-100 mb-4">
              {data.station.name} History
            </h2>
            <p className="text-sm text-stone-400 mb-2">
              USGS ID: {data.station.usgsId}
            </p>
            <p className="text-xs text-stone-500 mb-6">
              {chartData.length} data points
            </p>
            {chartData.length > 0 ? (
              <div className="space-y-8">
                {/* Flow Rate Chart */}
                {hasFlowData && (
                  <div>
                    <h3 className="text-lg font-semibold text-stone-100 mb-3">
                      Flow Rate (cfs)
                    </h3>
                    <div style={{ height: '250px' }}>
                      <Line data={flowChartData} options={flowChartOptions} />
                    </div>
                  </div>
                )}

                {/* Gage Height Chart */}
                {hasGageData && (
                  <div>
                    <h3 className="text-lg font-semibold text-stone-100 mb-3">
                      Gage Height (ft)
                    </h3>
                    <div style={{ height: '250px' }}>
                      <Line data={gageChartData} options={gageChartOptions} />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-center text-stone-400 p-4">
                No historical data available for this station.
              </p>
            )}
          </div>
        ) : (
          <div className="text-center text-stone-400 p-4">
            Select a station to view its history.
          </div>
        )}
      </div>
    </div>
  );
};

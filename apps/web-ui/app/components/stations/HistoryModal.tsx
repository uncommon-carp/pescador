import { useMemo } from 'react';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { Alert } from '../ui/Alert';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 p-4">
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
                    <ResponsiveContainer width="100%" height={250}>
                      <LineChart
                        data={chartData}
                        margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis
                          dataKey="date"
                          stroke="#94a3b8"
                          style={{ fontSize: '12px' }}
                          interval="preserveStartEnd"
                        />
                        <YAxis stroke="#94a3b8" style={{ fontSize: '12px' }} />
                        <Tooltip
                          labelFormatter={(value, payload) =>
                            payload[0]?.payload?.dateTime || value
                          }
                          contentStyle={{
                            backgroundColor: '#1e293b',
                            border: '1px solid #10b981',
                            borderRadius: '8px',
                          }}
                          labelStyle={{ color: '#e5e7eb' }}
                          cursor={{ stroke: '#94a3b8', strokeWidth: 1 }}
                          isAnimationActive={false}
                        />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="flow"
                          stroke="#fbbf24"
                          strokeWidth={3}
                          dot={{ r: 2, fill: '#fbbf24', strokeWidth: 0 }}
                          activeDot={{ r: 6, fill: '#fbbf24', stroke: '#fbbf24', strokeWidth: 2 }}
                          name="Flow Rate (cfs)"
                          connectNulls
                          isAnimationActive={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* Gage Height Chart */}
                {hasGageData && (
                  <div>
                    <h3 className="text-lg font-semibold text-stone-100 mb-3">
                      Gage Height (ft)
                    </h3>
                    <ResponsiveContainer width="100%" height={250}>
                      <LineChart
                        data={chartData}
                        margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis
                          dataKey="date"
                          stroke="#94a3b8"
                          style={{ fontSize: '12px' }}
                          interval="preserveStartEnd"
                        />
                        <YAxis stroke="#94a3b8" style={{ fontSize: '12px' }} />
                        <Tooltip
                          labelFormatter={(value, payload) =>
                            payload[0]?.payload?.dateTime || value
                          }
                          contentStyle={{
                            backgroundColor: '#1e293b',
                            border: '1px solid #10b981',
                            borderRadius: '8px',
                          }}
                          labelStyle={{ color: '#e5e7eb' }}
                          cursor={{ stroke: '#94a3b8', strokeWidth: 1 }}
                          isAnimationActive={false}
                        />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="gage"
                          stroke="#06b6d4"
                          strokeWidth={3}
                          dot={{ r: 2, fill: '#06b6d4', strokeWidth: 0 }}
                          activeDot={{ r: 6, fill: '#06b6d4', stroke: '#06b6d4', strokeWidth: 2 }}
                          name="Gage Height (ft)"
                          connectNulls
                          isAnimationActive={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
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

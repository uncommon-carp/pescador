import { useMemo } from 'react';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { Alert } from '../ui/Alert';

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
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) {
      return 'Invalid Date';
    }
    return date.toLocaleDateString();
  };

  const historicalRecords = useMemo(() => {
    if (!data?.station?.values) return [];

    const flowData = data.station.values.flow || [];
    const gageData = data.station.values.gage || [];

    const dataMap = new Map<
      string,
      { flowValue: string | null; gageValue: string | null }
    >();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    flowData.forEach((item: any) => {
      if (!dataMap.has(item.timestamp)) {
        dataMap.set(item.timestamp, { flowValue: null, gageValue: null });
      }
      dataMap.get(item.timestamp)!.flowValue = item.value;
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    gageData.forEach((item: any) => {
      if (!dataMap.has(item.timestamp)) {
        dataMap.set(item.timestamp, { flowValue: null, gageValue: null });
      }
      dataMap.get(item.timestamp)!.gageValue = item.value;
    });

    return Array.from(dataMap.entries())
      .map(([timestamp, values]) => ({ timestamp, ...values }))
      .sort(
        (a, b) =>
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );
  }, [data]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 p-4">
      <div className="relative w-full max-w-lg rounded-lg bg-slate-800 border border-emerald-700/40 p-6 shadow-2xl">
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
            <p className="text-sm text-stone-400 mb-4">
              USGS ID: {data.station.usgsId}
            </p>
            {historicalRecords.length > 0 ? (
              <div className="max-h-80 overflow-y-auto pr-2">
                <table className="min-w-full divide-y divide-emerald-700/40">
                  <thead className="bg-slate-900/50 sticky top-0">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-stone-300 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-stone-300 uppercase tracking-wider">
                        Flow (cfs)
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-stone-300 uppercase tracking-wider">
                        Height (ft)
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-emerald-700/30">
                    {historicalRecords.map((record, index: number) => (
                      <tr key={index}>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-stone-200">
                          {formatTimestamp(record.timestamp)}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-amber-400 font-semibold">
                          {record.flowValue !== null ? record.flowValue : 'N/A'}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-amber-400 font-semibold">
                          {record.gageValue !== null ? record.gageValue : 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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

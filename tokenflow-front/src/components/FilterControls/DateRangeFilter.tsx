import { Slider, SliderValue } from "@nextui-org/react"
import { useStore } from "@/components/store/useStore"
import { useState, useEffect, useCallback } from "react"
import debounce from 'lodash/debounce'
import throttle from 'lodash/throttle'

export const DateRangeFilter = () => {
  const { 
    filters, 
    setDateFilter, 
    getGlobalDateRange,
    fileConversations
  } = useStore()

  const [dateRange, setDateRange] = useState<{
    min: number;
    max: number;
  }>({
    min: 0,
    max: Date.now()
  });

  const [value, setValue] = useState<[number, number]>([0, Date.now()]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    try {
      const { min, max } = getGlobalDateRange();
      
      if (!isNaN(min.getTime()) && !isNaN(max.getTime())) {
        setDateRange({
          min: min.getTime(),
          max: max.getTime()
        });
        
        setValue([min.getTime(), max.getTime()]);
        setDateFilter({
          startDate: min.toISOString(),
          endDate: max.toISOString()
        });
      }
    } catch (error) {
      console.error('Erro ao configurar range de datas:', error);
    }
  }, [getGlobalDateRange, setDateFilter, fileConversations]);

  const formatDate = (timestamp: number) => {
    if (!isClient) return '';
    return new Date(timestamp).toLocaleDateString('pt-BR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Throttle para atualização visual do slider
  const handleVisualChange = useCallback(
    throttle((newValue: [number, number]) => {
      setValue(newValue);
    }, 16), // ~60fps
    []
  );

  // Debounce para atualização do filtro real
  const handleFilterChange = useCallback(
    debounce((newValue: [number, number]) => {
      setDateFilter({
        startDate: new Date(newValue[0]).toISOString(),
        endDate: new Date(newValue[1]).toISOString()
      });
    }, 300),
    [setDateFilter]
  );

  const handleChange = (newValue: number | number[]) => {
    if (!Array.isArray(newValue)) return;
    
    const typedValue: [number, number] = [newValue[0], newValue[1]];
    handleVisualChange(typedValue);
    handleFilterChange(typedValue);
  };

  if (!isClient) return null;

  const dayInMs = 24 * 60 * 60 * 1000;

  return (
    <div className="w-full px-4">
      <div className="flex justify-between mb-2 text-sm text-default-700">
        <span>{formatDate(value[0])}</span>
        <span>{formatDate(value[1])}</span>
      </div>
      <Slider
        size="lg"
        step={dayInMs}
        minValue={dateRange.min}
        maxValue={dateRange.max}
        value={value}
        onChange={handleChange}
        className="w-full"
        hideThumb={false}
        classNames={{
          base: "gap-3",
          track: "bg-default-500/30",
          thumb: [
            "bg-primary",
            "data-[dragging=true]:shadow-lg",
            "data-[dragging=true]:scale-125",
            "transition-transform",
          ],
          filler: "bg-primary"
        }}
      />
    </div>
  );
}; 
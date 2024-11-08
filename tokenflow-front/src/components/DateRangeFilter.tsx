import { Card, Slider } from '@nextui-org/react'
import { useStore } from '@/store/useStore'
import { useMemo } from 'react'

export const DateRangeFilter = () => {
  const { filters, setDateFilter } = useStore()

  // Calcula o range de datas disponível (últimos 6 meses até hoje)
  const dateRange = useMemo(() => {
    const now = new Date()
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    return {
      min: sixMonthsAgo.getTime(),
      max: now.getTime()
    }
  }, [])

  // Converte as datas do filtro para valores do slider
  const sliderValue = useMemo(() => {
    return [
      filters.dateFilter.startDate 
        ? new Date(filters.dateFilter.startDate).getTime() 
        : dateRange.min,
      filters.dateFilter.endDate
        ? new Date(filters.dateFilter.endDate).getTime()
        : dateRange.max
    ]
  }, [filters.dateFilter, dateRange])

  const handleDateChange = (value: number | number[]) => {
    if (Array.isArray(value)) {
      setDateFilter({
        startDate: new Date(value[0]).toISOString(),
        endDate: new Date(value[1]).toISOString()
      })
    }
  }

  // Formata a data para exibição
  const formatDate = (value: number) => {
    return new Date(value).toLocaleDateString('pt-BR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  return (
    <Card className="mb-4">
      <div className="p-6">
        {/* Display do Range Selecionado */}
        <div className="flex justify-between mb-4 text-sm text-default-500">
          <span>{formatDate(sliderValue[0])}</span>
          <span>{formatDate(sliderValue[1])}</span>
        </div>

        {/* Slider */}
        <Slider
          aria-label="Período"
          size="lg"
          step={24 * 60 * 60 * 1000} // 1 dia em milissegundos
          minValue={dateRange.min}
          maxValue={dateRange.max}
          value={sliderValue}
          onChange={handleDateChange}
          className="max-w-full"
          color="primary"
          formatOptions={{ style: "decimal" }}
          classNames={{
            base: "gap-3",
            labelWrapper: "mb-2",
            label: "font-medium text-default-700"
          }}
        />
      </div>
    </Card>
  )
} 
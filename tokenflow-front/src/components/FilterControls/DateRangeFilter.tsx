import { Slider } from "@nextui-org/react"
import { useStore } from "@/components/store/useStore"
import { useState, useEffect } from "react"

export const DateRangeFilter = () => {
  const { filters, setDateFilter } = useStore()
  const [sliderValue, setSliderValue] = useState<[number, number]>([0, 0])
  const [dateRange, setDateRange] = useState<{ min: number; max: number }>({ min: 0, max: 0 })
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    const now = Date.now()
    const sixMonthsFromNow = now + (6 * 30 * 24 * 60 * 60 * 1000)
    
    setDateRange({
      min: now,
      max: sixMonthsFromNow
    })
    
    setSliderValue([now, sixMonthsFromNow])
  }, [])

  // Formata a data para exibição
  const formatDate = (timestamp: number) => {
    if (!isClient) return ''
    return new Date(timestamp).toLocaleDateString('pt-BR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  // Atualiza o filtro quando o slider muda
  const handleDateChange = (value: number[]) => {
    const typedValue: [number, number] = [value[0], value[1]]
    setSliderValue(typedValue)
    setDateFilter({
      startDate: new Date(typedValue[0]).toISOString(),
      endDate: new Date(typedValue[1]).toISOString()
    })
  }

  if (!isClient) return null

  return (
    <div className="p-2">
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
  )
} 
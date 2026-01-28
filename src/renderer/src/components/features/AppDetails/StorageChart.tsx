import React from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { formatBytes } from '../../../utils/formatters'
import './StorageChart.css'

interface StorageChartProps {
  appSize: number
  junkSize: number
  appName: string
}

export const StorageChart = React.memo(function StorageChart({ appSize, junkSize, appName }: StorageChartProps) {
  const data = [
    { name: 'Application', value: appSize, color: 'var(--color-accent)' },
    { name: 'Junk Files', value: junkSize, color: 'var(--color-warning)' }
  ]

  const totalSize = appSize + junkSize

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0]
      return (
        <div className="storage-chart-tooltip">
          <p className="storage-chart-tooltip__label">{data.name}</p>
          <p className="storage-chart-tooltip__value">
            {formatBytes(data.value)}
          </p>
          <p className="storage-chart-tooltip__percentage">
            {((data.value / totalSize) * 100).toFixed(1)}%
          </p>
        </div>
      )
    }
    return null
  }

  const renderLegend = (props: any) => {
    const { payload } = props
    return (
      <ul className="storage-chart-legend">
        {payload.map((entry: any, index: number) => (
          <li key={index} className="storage-chart-legend__item">
            <span
              className="storage-chart-legend__color"
              style={{ backgroundColor: entry.color }}
            />
            <span className="storage-chart-legend__label">{entry.value}</span>
            <span className="storage-chart-legend__value">
              {formatBytes(entry.payload.value)}
            </span>
          </li>
        ))}
      </ul>
    )
  }

  return (
    <div className="storage-chart">
      <h3 className="storage-chart__title">Storage Breakdown</h3>
      <div className="storage-chart__container">
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={75}
              paddingAngle={2}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend content={renderLegend} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="storage-chart__total">
        <span className="storage-chart__total-label">Total Size:</span>
        <span className="storage-chart__total-value">{formatBytes(totalSize)}</span>
      </div>
    </div>
  )
})

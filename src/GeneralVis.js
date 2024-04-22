import { LineChart } from "@mui/x-charts";
import { format } from 'date-fns';

/**
 * Renders a line chart for different types of data, formatting values to one decimal place.
 * Optionally restricts the maximum value on the Y-axis.
 * @param {Object} props - Component props.
 * @param {Array} props.data - Array of data points.
 * @param {string} props.dataId - Unique identifier for the data type (e.g., 'Temperature', 'Humidity').
 * @param {string} props.label - Label for the data type to be displayed in the chart.
 * @param {string} props.unit - Unit of measurement for the data type (e.g., '°C', '%').
 * @param {number} [props.minY] - Optional minimum value for the Y-axis.
 * @param {number} [props.maxY] - Optional maximum value for the Y-axis.
 * @returns JSX.Element - A LineChart component displaying the specified data.
 */
function GeneralVis({ data, dataId, label, unit, minY, maxY }) {
    const indexData = data.map(item => ({
        ...item,
        timestamp: new Date(item.timestamp),
        value: parseFloat(item[dataId].toFixed(1))
    }));

    if (indexData.length === 0) return null;

    return (
        <LineChart
            width={360}
            height={280}
            xAxis={[{
                id: 'Date',
                data: indexData.map(item => item.timestamp),
                scaleType: 'time',
                label: 'Time',
                labelFormatter: (value) => format(value, 'yyyy-MM-dd HH:mm') 
            }]}
            yAxis={[{
                id: dataId,
                label: `${label} (${unit})`,
                scaleType: 'linear',
                min: minY,
                max: maxY
            }]}
            series={[{
                id: dataId,
                label: label,
                data: indexData.map(item => item.value),
                color: 'orange'
            }]}
        />
    );
}

export default GeneralVis;
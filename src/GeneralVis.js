import { LineChart } from "@mui/x-charts";

/**
 * Renders a line chart for different types of data, formatting values to one decimal place.
 * @param {Object} props - Component props.
 * @param {Array} props.data - Array of data points.
 * @param {string} props.dataId - Unique identifier for the data type (e.g., 'Temperature', 'Humidity').
 * @param {string} props.label - Label for the data type to be displayed in the chart.
 * @param {string} props.unit - Label for the data type to be displayed in the chart.
 * @returns JSX.Element - A LineChart component displaying the specified data.
 */
function GeneralVis({ data, dataId, label, unit }) {
    const timeData = data.map(item => item.timestamp);
    const indexData = data.map(item => ({
        ...item,
        value: parseFloat(item[dataId].toFixed(1))
    }));

    if(timeData.length === 0)
        return;

    return (
        <LineChart
            width={300}
            height={300}
            xAxis={[{
                id: 'Date',
                data: timeData,
                scaleType: 'time',
                label: 'Time'
            }]}
            yAxis={[{
                id: dataId,
                label: `${label} (${unit})`, // Assuming 'unit' is a property in each item
                scaleType: 'linear'
            }]}
            series={[{
                id: dataId,
                label: label,
                data: indexData.map(item => item.value),
            }]}
        />
    );
}

export default GeneralVis;
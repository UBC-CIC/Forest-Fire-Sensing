import { LineChart } from "@mui/x-charts";

/**
 * Renders a line chart for Fire Weather Index (FWI) data with a fixed y-axis range.
 * @param {Object} props - Component props.
 * @param {Array} props.FWIData - Array of FWI data points.
 * @returns JSX.Element - A LineChart component displaying FWI data with y-axis ranging from 0 to 100.
 */
function FWIVis({ FWIData }) {
    const timeData = FWIData.map(item => item.timestamp * 1000);
    const indexData = FWIData.map(item => item.fwi);

    return (
        <LineChart
            width={360}
            height={280}
            xAxis={[{
                id: 'Date',
                data: timeData,
                scaleType: 'time',
            }]}
            yAxis={[{
                id: 'FWI',
                scaleType: 'linear',
                minMax: [0, 100], // Ensures y-axis is always from 0 to 100
            }]}
            series={[{
                id: 'FWI',
                label: 'Fire Weather Index',
                data: indexData,
                color: 'orange'
            }]}
        />
    );
}

export default FWIVis;
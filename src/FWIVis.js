import { LineChart } from "@mui/x-charts";

/**
 * Renders a line chart for Fire Weather Index (FWI) data.
 * @param {Object} props - Component props.
 * @param {Array} props.FWIData - Array of FWI data points.
 * @returns JSX.Element - A LineChart component displaying FWI data.
 */
function FWIVis({ FWIData }) {
    const timeData = FWIData.map(item => item.timestamp * 1000);
    const indexData = FWIData.map(item => item.fwi);

    return (
        <LineChart
            width={300}
            height={300}
            xAxis={[{
                id: 'Date',
                data: timeData,
                scaleType: 'time',
            }]}
            series={[{
                id: 'FWI',
                label: 'Fire Weather Index',
                data: indexData,
            }]}
        />
    );
}

export default FWIVis;
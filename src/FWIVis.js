import { LineChart } from "@mui/x-charts";

function FWIVis(FWIData) {
    const timeData = [];
    const indexData = [];
    FWIData = FWIData['FWIdata']['satellite'];
    FWIData.forEach((item) => {
        timeData.push(item.timestamp*1000);
        indexData.push(item.fwi);
    });

    return (
        <LineChart
            width={300}
            height={300}
            xAxis={[
                {
                    id: 'Date',
                    data: timeData,
                    scaleType: 'time',
                }
            ]}
            series={[
                {
                    id: 'FWI',
                    label: 'Fire Weather Index',
                    data: indexData
                }

            ]}
        />
    );
}


export default FWIVis;
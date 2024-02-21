import { XYPlot, LineSeries, VerticalGridLines, HorizontalGridLines, XAxis, YAxis } from "react-vis";
import '../node_modules/react-vis/dist/style.css';

function FWIVis(FWIData) {
    const formattedData = [];
    FWIData = FWIData['FWIdata']['satellite'];
    FWIData.forEach((item) => {
        formattedData.push({ x: item.timestamp*1000, y: item.fwi })
    });

    return (
        <XYPlot height={300} width={300}>
            <XAxis xType="time" title="Date" />
            <YAxis title="Fire Weather Index (FWI)" />
            <VerticalGridLines />
            <HorizontalGridLines />
            <LineSeries data={formattedData}></LineSeries>
        </XYPlot>
    );
}


export default FWIVis;
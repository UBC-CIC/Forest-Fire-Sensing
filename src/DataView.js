import React from 'react';
import { Box, Typography } from '@mui/material';

function DataBox({ title, value, type }) {
  const getColor = (value, type) => {
    switch (type) {
      case 'fire':
        return value === 'Yes' ? 'red' : 'green';
      default:
        return 'white';
    }
  };

  const color = getColor(value, type);
  const fontColor = type === 'fire' ? 'white' : 'black';

  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      minHeight="120px"
      width="auto"
      sx={{ border: 2, borderColor: 'primary.main', p: 2, m: 2, borderRadius: 2, backgroundColor: color }}
    >
      <Typography variant="body1" component="p" sx={{color: fontColor}}>
        {title}
      </Typography>
      <Typography variant="h5" component="p" sx={{ fontWeight: 'bold', color: fontColor }}>
        {value}
      </Typography>
    </Box>
  );
}

function Dataview({ data }) {
  if (!data || data.length === 0) return null;

  const latestData = data[data.length - 1];
  const temperature = parseFloat(latestData['temperature'].toFixed(1));
  const humidity = parseFloat(latestData['humidity'].toFixed(1));
  const pressure = parseFloat(latestData['pressure'].toFixed(1));
  const co2 = latestData['co_2'].toFixed(1);
  const voc = latestData['voc'].toFixed(1);
  const timestamp = latestData['timestamp'];
  const isFire = latestData['isFire'];

  const time = new Date(timestamp);
  const pstDate = time.toLocaleString("en-US", { timeZone: "America/Los_Angeles" });

  return (
    <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center">
      <Box display="flex" flexDirection="row" flexWrap="wrap" justifyContent="center" alignItems="center" maxWidth="90%">
        <DataBox title="Fire Detected" value={isFire ? 'Yes' : 'No'} type="fire" />
        <DataBox title="Temperature" value={`${temperature}°C`} type="temperature" />
        <DataBox title="Humidity" value={`${humidity}%`} type="humidity" />
        <DataBox title="Pressure" value={`${pressure} Pa`} type="pressure" />
        <DataBox title="CO2" value={`${co2} ppm`} />
        <DataBox title="VOC" value={`${voc} ppm`} />
        <DataBox title="Updated At" value={pstDate} />
      </Box>
    </Box>
  );
}

export default Dataview;
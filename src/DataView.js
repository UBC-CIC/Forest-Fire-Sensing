import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

function Dataview({ data }){

  //get the latest data for sensor
  data = data[0];
  const temperature = data['temperature'].toFixed(1);
  const humidity = data['humidity'].toFixed(1);
  const pressure = data['pressure'].toFixed(1);
  const co2 = data['co_2'].toFixed(1);
  const voc = data['voc'].toFixed(1);
  const timestamp = data['timestamp'];

  return (
    <Paper elevation={3} sx={{ p: 2, maxWidth: 300, margin: 'auto', mt: 3 }}>
      <Typography variant="h6" component="h2" sx={{ fontSize: '1.2rem', fontWeight: 'bold', mb: 2 }}>
        Environment Status
      </Typography>
      <Box display="flex" flexDirection="column" gap={1}>
        <Typography variant="body1">Temperature: {temperature}°C</Typography>
        <Typography variant="body1">Humidity: {humidity}%</Typography>
        <Typography variant="body1">Pressure: {pressure} hPa</Typography>
        <Typography variant="body1">CO2: {co2} ppm</Typography>
        <Typography variant="body1">VOC: {voc} ppb</Typography>
        <Typography variant="body1">Updated At: {timestamp}</Typography>
      </Box>
    </Paper>
  );
};

export default Dataview;
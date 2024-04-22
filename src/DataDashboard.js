import { useEffect, useState } from 'react';
import { Box, Drawer, Typography } from '@mui/material';
import FWIVis from './FWIVis';
import GeneralVis from './GeneralVis';
import Dataview from './DataView';

function DataDashboard({ data, locationInfo }) {
    const [isDrawerOpen, setDrawerOpen] = useState(false);
    const toggleDrawer = () => setDrawerOpen(!isDrawerOpen);
    const appBarHeight = 64; // Height of AppBar for layout calculation

    useEffect(() => {
        setDrawerOpen(true);
    }, [data]);

    return (
        <Drawer
            anchor="right"
            open={isDrawerOpen}
            onClose={toggleDrawer}
            sx={{
                '& .MuiDrawer-paper': {
                    top: `${appBarHeight}px`,
                    height: `calc(100% - ${appBarHeight}px)`,
                    maxWidth: '33vw', // Adjusting maximum width

                }
            }}
            ModalProps={{
                BackdropProps: {
                    style: {
                        backgroundColor: 'transparent',
                        opacity: 0,
                    }
                }
            }}
        >
            <Box
                sx={{
                    width: '100%', 
                    p: 2, 
                    display: 'flex', 
                    flexDirection: 'column', // Added to structure the content vertically
                    alignItems: 'center' // Centers content horizontally
                }}
                role="presentation"
            >
                <Box
                    sx={{
                        width: '100%',
                        textAlign: 'center' // Centers the text horizontally within the box
                    }}
                >
                <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                    {locationInfo.locationName || 'Unknown Device'}
                </Typography>
                </Box>
                <Box sx={{ width: '100%', display: 'flex', flexWrap: 'wrap' }}>
                    <Dataview data={data['sensor']} />
                    <FWIVis FWIData={data['satellite']} />
                    <GeneralVis data={data['sensor']} dataId={'temperature'} label={'Temperature'} unit={'°C'} minY={'-30'} maxY={'70'} />
                    <GeneralVis data={data['sensor']} dataId={'humidity'} label={'Humidity'} unit={'%'} minY={'0'} maxY={'100'}/>
                    <GeneralVis data={data['sensor']} dataId={'pressure'} label={'Pressure'} unit={'Pa'} />
                    <GeneralVis data={data['sensor']} dataId={'co_2'} label={'CO2'} unit={'ppm'} />
                    <GeneralVis data={data['sensor']} dataId={'voc'} label={'VOC'} unit={'ppm'} />
                </Box>
            </Box>
        </Drawer>
    );
}

export default DataDashboard;

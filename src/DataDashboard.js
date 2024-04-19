import { useEffect, useState } from 'react';
import { Box, Drawer } from '@mui/material';
import FWIVis from './FWIVis';
import GeneralVis from './GeneralVis';

function DataDashboard({ data }) {
    const [isDrawerOpen, setDrawerOpen] = useState(false);
    const toggleDrawer = () => setDrawerOpen(!isDrawerOpen);
    const appBarHeight = 64; // Typically 64px for desktop AppBar

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
                    top: `${appBarHeight}px`, // Start below the AppBar
                    height: `calc(100% - ${appBarHeight}px)`, // Adjust height to fit below AppBar
                }
            }}
            ModalProps={{
                BackdropProps: {
                    style: {
                        backgroundColor: 'transparent', // Set backdrop color to transparent
                        opacity: 0, // Set opacity to 0 to prevent dimming
                    }
                }
            }}
        >
            <Box
              sx={{ width: '100%' }} // Make the Box fill the Drawer width
              role="presentation"
            >
                <FWIVis FWIData={data['satellite']}/>
                <GeneralVis data={data['sensor']} dataId={'temperature'} label={'Temperature'} unit={'°C'}/>
                <GeneralVis data={data['sensor']} dataId={'humidity'} label={'Humidity'} unit={'%'}/>
                <GeneralVis data={data['sensor']} dataId={'pressure'} label={'Pressure'} unit={'Pa'}/>
                <GeneralVis data={data['sensor']} dataId={'co_2'} label={'CO2'} unit={'ppm'}/>
                <GeneralVis data={data['sensor']} dataId={'voc'} label={'VOC'} unit={'ppm'}/>
                
            </Box>
        </Drawer>
    );
}

export default DataDashboard;

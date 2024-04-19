import {useEffect, useState} from 'react'
import { Box, Drawer } from '@mui/material'
import FWIVis from './FWIVis'

function DataDashboard({ data }) {
    const [isDrawerOpen, setDrawerOpen] = useState(false);
    const toggleDrawer = () => setDrawerOpen(!isDrawerOpen);
    const appBarHeight = 64; // Typically 64px for desktop AppBar

    useEffect(()=>{
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
      >
        <Box
          sx={{ width: 300 }}
          role="presentation"
          onClick={toggleDrawer}
          onKeyDown={toggleDrawer}
        >
            <FWIVis FWIData={data['satellite']}/>
        </Box>
      </Drawer>
    )
}

export default DataDashboard;
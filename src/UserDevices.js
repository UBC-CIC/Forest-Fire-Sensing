import React from 'react';
import AddDevice from "./AddDevice";
import AddSubscription from "./AddSubscription";
import CancelSub from "./cancelSub";
import { Tab, Tabs, Box, Typography } from '@mui/material';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`vertical-tabpanel-${index}`}
      aria-labelledby={`vertical-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index) {
  return {
    id: `vertical-tab-${index}`,
    'aria-controls': `vertical-tabpanel-${index}`,
  };
}

function UserDevices({ submitAction_2, submitAction_3, submitAction_4, queryAction }) {
  const [value, setValue] = React.useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <Box
      sx={{ flexGrow: 1, bgcolor: 'background.paper', display: 'flex', height: 224 }}
    >
      <Tabs
        orientation="vertical"
        variant="scrollable"
        value={value}
        onChange={handleChange}
        aria-label="Vertical tabs example"
        sx={{ borderRight: 1, borderColor: 'divider' }}
      >
        <Tab label={<Typography sx={{ fontWeight: 'bold' }}>Add Device</Typography>} {...a11yProps(0)} />
        <Tab label={<Typography sx={{ fontWeight: 'bold' }}>Add Subscription</Typography>} {...a11yProps(1)} />
        <Tab label={<Typography sx={{ fontWeight: 'bold' }}>Cancel Subscription</Typography>} {...a11yProps(2)} />
      </Tabs>
      <TabPanel value={value} index={0}>
        <AddDevice submitAction={submitAction_2} />
      </TabPanel>
      <TabPanel value={value} index={1}>
        <AddSubscription submitAction={submitAction_3} />
      </TabPanel>
      <TabPanel value={value} index={2}>
        <CancelSub queryAction={queryAction} submitAction={submitAction_4} />
      </TabPanel>
    </Box>
  );
}

export default UserDevices;

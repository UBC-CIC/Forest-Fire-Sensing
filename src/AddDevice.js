import { Button, TextField, FormControlLabel, Switch, Box } from '@mui/material';
import { useState } from 'react';

function AddDevice({ submitAction }) {
  const [devEUI, setDevEUI] = useState('');
  const [lat, setLat] = useState('');
  const [lon, setLon] = useState('');
  const [name, setName] = useState('');
  const [publicLocation, setPublicLocation] = useState(false);

  const params = {
    devEUI,
    lat,
    lon,
    name,
    publicLocation
  };

  function formSubmitHandler(e) {
    e.preventDefault();
    submitAction(params);
  }

  return (
    <Box sx={{ width: '50%', minWidth: 300, maxWidth: 500, margin: 'auto' }}>
      <form onSubmit={formSubmitHandler}>
        <TextField label="Name" variant="outlined" fullWidth margin="normal" required 
                   onChange={(e) => setName(e.target.value)} />
        <TextField label="Latitude" type="number" variant="outlined" fullWidth margin="normal" required 
                   onChange={(e) => setLat(e.target.value)} />
        <TextField label="Longitude" type="number" variant="outlined" fullWidth margin="normal" required 
                   onChange={(e) => setLon(e.target.value)} />
        <TextField label="devEUI" variant="outlined" fullWidth margin="normal" required 
                   onChange={(e) => setDevEUI(e.target.value)} />
        <FormControlLabel 
          control={<Switch checked={publicLocation} onChange={(e) => setPublicLocation(e.target.checked)} />} 
          label="Make Location Public"
        />
        <Button type="submit" variant="contained">Add Device</Button>
      </form>
    </Box>
  );
}

export default AddDevice;

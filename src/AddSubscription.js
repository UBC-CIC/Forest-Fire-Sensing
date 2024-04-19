import React, { useState } from 'react';
import { Button, TextField } from '@mui/material';

function AddSubscription({ submitAction }) {
    const [lat, setLat] = useState('');
    const [lon, setLon] = useState('');

    const params = {
        lat: lat,
        lon: lon
    };

    function formSubmitHandler(e) {
        e.preventDefault();
        submitAction(params);
    }

    return (
        <div>
            <form onSubmit={formSubmitHandler} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                <TextField
                    type="number"
                    label="Latitude"
                    variant="outlined"
                    value={lat}
                    onChange={(e) => setLat(e.target.value)}
                    required
                    style={{ width: '80%' }}
                />
                <TextField
                    type="number"
                    label="Longitude"
                    variant="outlined"
                    value={lon}
                    onChange={(e) => setLon(e.target.value)}
                    required
                    style={{ width: '80%' }}
                />
                <Button type="submit" variant="contained" color="primary">
                    Subscribe
                </Button>
            </form>
        </div>
    );
}

export default AddSubscription;
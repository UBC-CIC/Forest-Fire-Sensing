import { Button, Input } from '@aws-amplify/ui-react';
import { useState } from 'react'


function AddSubscription({submitAction}) {
    const [lat, setLat] = useState('');
    const [lon, setLon] = useState('');

    const params = {
        lat: lat,
        lon: lon
    }

    function formSubmitHandler(e) {
        e.preventDefault();
        submitAction(params);
    }

    return (
        <div>
            <form onSubmit={(e)=> formSubmitHandler(e)}>
            <Input type="number" step="any" placeholder='Longitude' onChange={(e) => setLat(e.currentTarget.value)} width="30%" isRequired/>
            <br/>
            <Input type="number" step="any" placeholder='Latitude' onChange={(e) => setLon(e.currentTarget.value)} width="30%" isRequired/>
            <br/>
            <Button type="submit">Subscribe</Button>
            </form>
        </div>
    );
}

export default AddSubscription;
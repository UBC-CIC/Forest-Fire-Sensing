import { Button, Input, SwitchField } from '@aws-amplify/ui-react';
import { useState } from 'react'


function AddDevice({submitAction}) {
    const [devEUI, setDevEUI] = useState('');
    const [lat, setLat] = useState('');
    const [lon, setLon] = useState('');
    const [name, setName] = useState('');
    const [publicLocation, setPublicLocation] = useState(false);

    const params = {
        devEUI: devEUI,
        lat: lat,
        lon: lon,
        name: name,
        publicLocation: publicLocation
    }

    function formSubmitHandler(e) {
        e.preventDefault();
        submitAction(params);
    }

    return (
        <div>
            <form onSubmit={(e)=> formSubmitHandler(e)}>
            <Input type="text" placeholder='Name' onChange={(e) => setName(e.currentTarget.value)} width="30%" isRequired/>
            <br/>
            <Input type="number" step="any" placeholder='Latitude' onChange={(e) => setLat(e.currentTarget.value)} width="30%" isRequired/>
            <br/>
            <Input type="number" step="any" placeholder='Longitude' onChange={(e) => setLon(e.currentTarget.value)} width="30%" isRequired/>
            <br/>
            <Input type="text" placeholder='devEUI' onChange={(e) => setDevEUI(e.currentTarget.value)} width="30%" isRequired/>
            <br/>
            <SwitchField label="Make Location Public" onChange={(e)=> setPublicLocation(e.target.checked)} trackCheckedColor={"#104c4e"}/>
            <br/>
            <Button type="submit">Add Device</Button>
            </form>
        </div>
    );
}

export default AddDevice;
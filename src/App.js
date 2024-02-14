import './App.css';
import {Amplify} from 'aws-amplify';
import {get} from 'aws-amplify/api';
import awsconfig from './aws-exports';
import {useState} from 'react';
import Map from './Map';
import Login from './Login';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';

const _ = require('lodash');

Amplify.configure(awsconfig);

function App() {
  const [latitude, setLat] = useState('');
  const [longitude, setLon] = useState('');
  const [json, setJSON] = useState('');
  const [loginOverlay, setLoginOverlay] = useState(false);

  function inputHandlerLat(event){
    setLat(event.target.value);
  }

  function inputHandlerLon(event){
    setLon(event.target.value);
  }

  function signInButtonHandler(){
    setLoginOverlay(true);
  }

  function loginExitButtonHandler(){
    setLoginOverlay(false);
  }

  function formatFireData(json){
    if(json === ""){
      return;
    }
    return (
      <table>
        <thead>
          <tr>
            <th>FWI</th>
            <th>Danger Description</th>
            <th>Danger Value</th>
            <th>DT</th>
            <th>Time (UTC)</th>
          </tr>
        </thead>
        <tbody>
          {json.map((item, index) => (
            <tr key={index}>
              <td>{item.fwi}</td>
              <td>{item.danger_description}</td>
              <td>{item.danger_value}</td>
              <td>{item.timestamp}</td>
              <td>{new Date(item.dt*1000).toUTCString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  async function api() {
    try {
      const restOperation = get({ 
        apiName: 'apib7c99001',
        path: `/data/${latitude}#${longitude}`,
        options: {
          queryParams: {
            "lat": latitude,
            "lon": longitude
          }
        }
      });
      const response = await restOperation.response;
      console.log(response)
      const json = await response.body.json();
      setJSON(json);
      console.log('GET call succeeded: ', json);

    } catch (error) {
      console.log('GET call failed: ', error);
    }
  }
  
  async function getLocations() {
    try {
      const restOperation = get({ 
        apiName: 'apib7c99001',
        path: `/locations`,
        options: {}
      });
      const response = await restOperation.response;
      const json = await response.body.json();
      setMarkers(json)
    } catch (error) {
      console.log('GET call failed: ', error);
    } 
  }
  
  var locations = []

  async function setMarkers(json){
    json.forEach(element => {
      var coord = _.get(element, 'coord.S', '');
      var lat = coord.split('#')[0]
      var lon = coord.split('#')[1]
      var locationName = _.get(element, 'locationName.S', '')
      locations.push({
        'coordinates': {'lat': lat, 'lon': lon},
        'locName': locationName
      })
    });
  }

  getLocations()




function Map(locations, coordinates) {
  return (
    <MapContainer center={coordinates} zoom={13} style={{ height: '400px', width: '100%' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {locations.map((location, index) => (
        <Marker key={index} position={location.coordinates}>
          <Popup>
            {location.locName}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

console.log(Map(locations, {'lat': 49.2827,'lon': -123.1207}))

  return (
    <div className="App">
      <p>Latitude: </p>
      <input type="text" value={latitude} onChange={inputHandlerLat}/>
      <p>Longitude</p>
      <input type="text" value={longitude} onChange={inputHandlerLon}/>
      <br/>
      <button onClick={api}>Get Fire Risk</button>
      <br/>
      <button onClick={signInButtonHandler}> Sign In or Sign Up</button>
      {loginOverlay && <Login closeHandler={loginExitButtonHandler}/>}
      <p></p>
      {Map(locations, {'lat': 49.2827,'lon': -123.1207})}
    </div>
  );
}

export default App;

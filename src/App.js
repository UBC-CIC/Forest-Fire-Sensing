import './App.css';
import {Amplify} from 'aws-amplify';
import {get} from 'aws-amplify/api';
import awsconfig from './aws-exports';
import {useState} from 'react';
import { SHA256 } from 'crypto-js';

const _ = require('lodash');

Amplify.configure(awsconfig);

function App() {
  const [latitude, setLat] = useState('');
  const [longitude, setLon] = useState('');
  const [json, setJSON] = useState('');

  function inputHandlerLat(event){
    setLat(event.target.value);
  }

  function inputHandlerLon(event){
    setLon(event.target.value);
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
          {json["list"].map((item, index) => (
            <tr key={index}>
              <td>{item.main.fwi}</td>
              <td>{item.danger_rating.description}</td>
              <td>{item.danger_rating.value}</td>
              <td>{item.dt}</td>
              <td>{new Date(item.dt*1000).toUTCString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }


  function createUniqueID(latitude, longitude, timestamp) {
    let concatenatedString = `${latitude}_${longitude}_${timestamp}`;
    let hashedString = SHA256(concatenatedString).toString();
    let randomNumber = getRandomInt(1000, 9999);

    let currentTimestamp = new Date().getTime();
    let uniqueID = `${hashedString}_${currentTimestamp}_${randomNumber}`;
    return uniqueID;
  }

  async function api() {
    try {
      const restOperation = get({ 
        apiName: 'apibcf31860',
        path: '/items',
        options: {
          queryParams: {
            "lat": latitude,
            "lon": longitude
          }
        }
      });
      const response = await restOperation.response;
      const json = await response.body.json();
      setJSON(json);
      console.log('GET call succeeded: ', json);

      const coordinates = json['coord'];
      for(let i of json['list']){
        let dt = i['dt'];
        let data_id = createUniqueID(coordinates['lat'], coordinates['lon'], dt);
        get({ 
          apiName: 'apia22561c3',
          path: '/putitem',
          options: {
            queryParams: {
              "data_id": data_id,
              "lat": coordinates['lat'],
              "lon":coordinates['lon'],
              "fwi": _.get(i, 'main.fwi', ''),
              "dt": dt,
              "danger_description": _.get(i, 'danger_rating.description', ''),
              "danger_value": _.get(i, 'danger_rating.value', ''),
            }
          }
        });
        console.log('Write succeeded', );
      }
    } catch (error) {
      console.log('GET call failed: ', error);
    }
  }
  

  return (
    <div className="App">
      <p>Latitude: </p>
      <input type="text" value={latitude} onChange={inputHandlerLat}/>
      <p>Longitude</p>
      <input type="text" value={longitude} onChange={inputHandlerLon}/>
      <br/>
      <button onClick={api}>Get Fire Risk</button>
      <br/>
      {formatFireData(json)}
      <p></p>
    </div>
  );
}

export default App;

import './App.css';
import {Amplify} from 'aws-amplify';
import {get} from 'aws-amplify/api';
import awsconfig from './aws-exports';
import {useState} from 'react';
import Map from './Map';
import Login from './Login';

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
      <button onClick={signInButtonHandler}> Sign In or Sign Up</button>
      {loginOverlay && <Login closeHandler={loginExitButtonHandler}/>}
      <p></p>
      <Map coordinates={[latitude, longitude]} fireData={formatFireData(json)} json={json}/>
    </div>
  );
}

export default App;

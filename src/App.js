import './App.css';
import {Amplify} from 'aws-amplify';
import { useAuthenticator, Button } from '@aws-amplify/ui-react';
import {get} from 'aws-amplify/api';
import {fetchAuthSession} from 'aws-amplify/auth'
import awsconfig from './aws-exports';
import {useState} from 'react';
import Map from './Map';
import Login from './Login';

Amplify.configure(awsconfig);

function App() {
  const [latitude, setLat] = useState('');
  const [longitude, setLon] = useState('');
  const [loginOverlay, setLoginOverlay] = useState(false);
  const [locationData, setLocationData] = useState();
  const [userLocationData, setUserLocationData] = useState();
  const [onlyUserData, setOnlyUserData] = useState(false);

  const {user, signOut} = useAuthenticator((context) => [context.user]);
  const {authStatus} = useAuthenticator((context) => [context.authStatus]);

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

  function isLoggedIn(){
    return authStatus === 'authenticated';
  }

  function getUsername(){
    if(user == null)
      return;
    return user.username;
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
              <td>{new Date(item.timestamp*1000).toUTCString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  function formatLocations(jsonLocations){
    let result = [];

    jsonLocations.map((item) => {
      let coords = item.coord.S.split('#');

      result.push([parseFloat(coords[0]), parseFloat(coords[1])])
    });
    return result;
  }

  async function getUserToken(){
    const token = (await fetchAuthSession()).tokens.idToken;
    return token;
  }

  async function getFWIAPIResult() {
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
      setLocationData(locationData => [...locationData, [[latitude, longitude], formatFireData(json)]])
      console.log('GET call succeeded: ', json);

    } catch (error) {
      console.log('GET call failed: ', error);
    }
  }

  async function getLocations() {
    try {
      const restOperation = get({ 
        apiName: 'apib7c99001',
        path: `/locations`
      });
      const response = await restOperation.response;
      console.log(response)
      const json = await response.body.json();
      console.log('GET call succeeded: ', json);
      return json;
    } catch (error) {
      console.log('GET call failed: ', error);
    }
  }

  async function getLocationData(coordinates) {
    try {
      const restOperation = get({ 
        apiName: 'apib7c99001',
        path: `/data/${coordinates[0]}#${coordinates[1]}`,
        options: {
          queryParams: {
            "lat": coordinates[0],
            "lon": coordinates[1]
          }
        }
      });
      const response = await restOperation.response;
      console.log(response)
      const json = await response.body.json();
      console.log('GET call succeeded: ', json);
      return json;
    } catch (error) {
      console.log('GET call failed: ', error);
    }
  }

  async function getUserSensors() {
    const token = await getUserToken();
    try {
      const restOperation = get({
        apiName: 'apib7c99001',
        path: `/user-sensors`,
        options: {
          headers: {
            Authorization: token
          }
        }
      });
      const response = await restOperation.response;
      const json = await response.body.json();
      console.log('GET call succeeded: ', json);
      return json;
    } catch (error) {
      console.log('GET call failed: ', error);
    }
  }
  

  async function getAllLocationData(isUserLocation) {
    const jsonLocations = isUserLocation ? await getUserSensors() : await getLocations();
    const locationList = formatLocations(jsonLocations);
    let locData = [];
    console.log(locationList);
    for(let i = 0; i < locationList.length; i++){
      let data = await getLocationData(locationList[i]);
      locData.push([locationList[i], formatFireData(data)]);
    }

    isUserLocation ? setUserLocationData(locData) : setLocationData(locData);
    isUserLocation ? setOnlyUserData(true) : setOnlyUserData(false);
  }

  return (
    <div className="App">
      {isLoggedIn() && <h3>Welcome {getUsername()}</h3>}
      <p>Latitude: </p>
      <input type="text" value={latitude} onChange={inputHandlerLat}/>
      <p>Longitude</p>
      <input type="text" value={longitude} onChange={inputHandlerLon}/>
      <br/>
      <Button onClick={getFWIAPIResult}>Get Fire Risk</Button>
      <Button onClick={() => getAllLocationData(false)}>Get Locations</Button>
      <Button onClick={() => getAllLocationData(true)}>Get User Sensors</Button>     
      <br/>
      {!isLoggedIn() && <Button onClick={signInButtonHandler}> Sign In or Sign Up</Button>}
      {isLoggedIn() && <Button onClick={signOut}> Sign Out</Button>}
      {loginOverlay && <Login closeHandler={loginExitButtonHandler}/>}
      <p></p>
      <Map locationData={onlyUserData ? userLocationData : locationData}/>
    </div>
  );
}

export default App;

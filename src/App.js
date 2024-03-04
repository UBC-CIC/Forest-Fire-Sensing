import './App.css';
import { Amplify } from 'aws-amplify';
import { useAuthenticator, Button, Grid, Card, Heading} from '@aws-amplify/ui-react';
import { get, put } from 'aws-amplify/api';
import { fetchAuthSession } from 'aws-amplify/auth'
import awsconfig from './aws-exports';
import { useState, useEffect } from 'react';
import Map from './Map';
import Login from './Login';
import UserDevices from './UserDevices';

Amplify.configure(awsconfig);

function App() {
  const [loginOverlay, setLoginOverlay] = useState(false);
  const [publicLocations, setPublicLocations] = useState();
  const [userLocations, setUserLocations] = useState();
  const [onlyUserData, setOnlyUserData] = useState(false);

  const { user, signOut } = useAuthenticator((context) => [context.user]);
  const { authStatus } = useAuthenticator((context) => [context.authStatus]);

  function signInButtonHandler() {
    setLoginOverlay(true);
  }

  useEffect(() => {
    // Reset state when user signs out
    if (authStatus !== 'authenticated') {
      setPublicLocations(undefined);
      setUserLocations(undefined);
      setOnlyUserData(false);
    }
  }, [authStatus]);

  function loginExitButtonHandler() {
    setLoginOverlay(false);
  }

  function isLoggedIn() {
    return authStatus === 'authenticated';
  }

  function getUsername() {
    if (user == null)
      return;
    return user.username;
  }

  function formatFireData(json) {
    if (json === "") {
      return;
    }
    json = json['satellite'];
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
              <td>{new Date(item.timestamp * 1000).toUTCString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  function formatLocations(jsonLocations) {
    let result = [];

    jsonLocations.forEach((item) => {
      let lat = item.lat.N;
      let lon = item.lon.N;
      let sensorID = item.sensorID.S;

      result.push([lat, lon, sensorID])
    });
    return result;
  }

  async function getUserToken() {
    const token = (await fetchAuthSession()).tokens.idToken;
    return token;
  }

  async function getLocations() {
    try {
      const restOperation = get({
        apiName: 'apib7c99001',
        path: `/locations`
      });
      const response = await restOperation.response;
      const json = await response.body.json();
      return json;
    } catch (error) {
      console.log('GET call failed: ', error);
    }
  }

  async function getLocationData(params) {
    console.log(params)
    try {
      const restOperation = get({
        apiName: 'apib7c99001',
        path: `/data/${params[2]}`,
        options: {
          queryParams: {
            "sensorID": params[2]
          }
        }
      });
      const response = await restOperation.response;
      const json = await response.body.json();
      return json;
    } catch (error) {
      console.log('GET call failed: ', error);
    }
  }

  async function getUserSensors() {
    try {
      const authToken = await getUserToken();
      const restOperation = get({
        apiName: 'apib7c99001',
        path: `/user-sensors`,
        options: {
          headers:{Authorization: authToken}
        }
      });
      const response = await restOperation.response;
      const json = await response.body.json();
      return json;
    } catch (error) {
      console.log('GET call failed: ', error);
      return [];
    }
  }

  async function putLocation(params) {
    try {
      const authToken = await getUserToken();
      const restOperation = put({
        apiName: 'apib7c99001',
        path: `/location/${params['devEUI']}`,
        options: {
          queryParams: {
            sensorID: params['devEUI'],
            lat: params['lat'],
            lon: params['lon'],
            locationName: params['name'],
            publicLocation: params['publicLocation'],
          },
          headers:{Authorization: authToken}
        }
      });
      const response = await restOperation.response;
      const json = await response.body.json();
      console.log('Device added successfully', json);
    } catch (error) {
      console.log('PUT call failed: ', error);
    }
  }


  async function getAllLocationData(isUserLocation) {
    const jsonLocations = isUserLocation ? await getUserSensors() : await getLocations();
    const locationList = formatLocations(jsonLocations);

    isUserLocation ? setUserLocations(locationList) : setPublicLocations(locationList);
    isUserLocation ? setOnlyUserData(true) : setOnlyUserData(false);
  }

  return (
    <div className="App">
      <Grid className="base">
        <Card className="header">
          <Heading level={1}>Forest Fire Detection🌲🔥</Heading>
          {isLoggedIn() && <Heading level={3}>Welcome {getUsername()}</Heading>}
          <Button onClick={() => getAllLocationData(false)}>View Public Locations</Button>
          <Button onClick={() => getAllLocationData(true)}>View User Sensors</Button>
          {!isLoggedIn() && <Button onClick={signInButtonHandler}> Sign In or Sign Up</Button>}
          {isLoggedIn() && <Button onClick={signOut}> Sign Out</Button>}
          {loginOverlay && <Login closeHandler={loginExitButtonHandler} />}
        </Card>
        <Card className="nav">
          {isLoggedIn() && <UserDevices submitAction={putLocation} />}
        </Card>
        <Card className="main">
          <Map
            key={onlyUserData ? 'userLocations' : 'publicLocations'}
            locations={onlyUserData ? userLocations : publicLocations}
            getLocationData={getLocationData}
          />
        </Card>
      </Grid>
    </div>
  );
}

export default App;

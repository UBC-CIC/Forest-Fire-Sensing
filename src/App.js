import './App.css';
import { Amplify } from 'aws-amplify';
import { useAuthenticator, Grid, Card} from '@aws-amplify/ui-react';
import { get, put } from 'aws-amplify/api';
import { fetchAuthSession } from 'aws-amplify/auth'
import awsconfig from './aws-exports';
import { useState, useEffect } from 'react';
import Map from './Map';
import UserDevices from './UserDevices';
import Header from './Header';
import {Drawer} from '@mui/material'

Amplify.configure(awsconfig);

function App() {
  const [publicLocations, setPublicLocations] = useState();
  const [userLocations, setUserLocations] = useState();
  const [onlyUserData, setOnlyUserData] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);

  const { user, signOut } = useAuthenticator((context) => [context.user]);
  const { authStatus } = useAuthenticator((context) => [context.authStatus]);

  useEffect(() => {
    // Reset state when user signs out
    if (authStatus !== 'authenticated') {
      setPublicLocations(undefined);
      setUserLocations(undefined);
      setOnlyUserData(false);
    }
  }, [authStatus]);

  function isLoggedIn() {
    return authStatus === 'authenticated';
  }

  function handleDrawer(){
    setShowDrawer(!showDrawer);
  }

  function getUsername() {
    if (user == null)
      return;
    return user.username;
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
      <Header username={getUsername()} authStatus={isLoggedIn()} signOut={signOut} getAllLocationData={getAllLocationData} menuIconAction={handleDrawer}/>
      <Grid className="base">
        <Drawer open={showDrawer} onClose={handleDrawer}>
        
        <Card className="nav">
          {isLoggedIn() && <UserDevices submitAction={putLocation} />}
        </Card>
        </Drawer>

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

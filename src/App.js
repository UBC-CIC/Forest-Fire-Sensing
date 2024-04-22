import './App.css';
import { Amplify } from 'aws-amplify';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { get, put } from 'aws-amplify/api';
import { fetchAuthSession } from 'aws-amplify/auth'
import awsconfig from './aws-exports';
import { useState, useEffect } from 'react';
import Map from './Map';
import UserDevices from './UserDevices';
import Header from './Header';
import { Drawer } from '@mui/material'
import SimpleDialog from './SimpleDialog';

Amplify.configure(awsconfig);

function App() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");

  const openDialog = (message) => {
    setDialogMessage(message);
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
  };

  const [locations, setLocations] = useState();
  const [showDrawer, setShowDrawer] = useState(false);

  const { user, signOut } = useAuthenticator((context) => [context.user]);
  const { authStatus } = useAuthenticator((context) => [context.authStatus]);

  const appBarHeight = 64; // Typically 64px for desktop AppBar

  useEffect(() => {
    // Reset state when user signs out
    if (authStatus !== 'authenticated') {
      getAllLocationData();
    } else if (authStatus === 'authenticated'){
      getAllLocationData();
    }
  }, [authStatus]);

  function isLoggedIn() {
    return authStatus === 'authenticated';
  }

  function handleDrawer() {
    setShowDrawer(!showDrawer);
  }

  function getUsername() {
    if (user == null)
      return;
    return user.username;
  }

  function formatLocations(jsonLocations, userSensors) {
    let result = [];

    jsonLocations.forEach((item) => {
      var location = {
        lat: item.lat.N,
        lon: item.lon.N,
        sensorID: item.sensorID.S,
        isUser: userSensors
      }

      result.push(location);
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
        path: `/data/${params.sensorID}`,
        options: {
          queryParams: {
            "sensorID": params.sensorID
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
        apiName: 'authapi',
        path: `/user-sensors`,
        options: {
          headers: { Authorization: authToken }
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
        apiName: 'authapi',
        path: `/location/${params['devEUI']}`,
        options: {
          queryParams: {
            sensorID: params['devEUI'],
            lat: params['lat'],
            lon: params['lon'],
            locationName: params['name'],
            publicLocation: params['publicLocation'],
          },
          headers: { Authorization: authToken }
        }
      });
      await restOperation.response;
      openDialog('Add device successfully');
    } catch (error) {
      openDialog('Add device not success, please try again');
    }
  }

  async function addSubscription(params) {
    try {
      const authToken = await getUserToken();
      const lat = params['lat'];
      const lon = params['lon'];
      const restOperation = put({
        apiName: 'authapi',
        path: `/sub/${getUsername()}/${lat}#${lon}`,
        options: {
          queryParams: {
            lat: lat,
            lon: lon,
          },
          headers: { Authorization: authToken }
        }
      });
      await restOperation.response;
      openDialog('Subscribe successfully');
    } catch (error) {
      openDialog('Substribe not success, please try again');
    }
  }

  async function cancelSub(params) {
    try {
      const authToken = await getUserToken();
      const username = getUsername();
      const createTime = params['createTime'];
      const restOperation = put({
        apiName: 'authapi',
        path: `/cancelSub/${username}/${createTime}`,
        options: {
          queryParams: {
            username: username,
            createTime: createTime,
          },
          headers: { Authorization: authToken }
        }
      });
      await restOperation.response;
      openDialog('Unsubscribe successfully');
    } catch (error) {
      openDialog('Unsubstribe not success, please try again');
    }
  }

  async function querySub() {
    try {
      const authToken = await getUserToken();
      const username = getUsername();
      const restOperation = get({
        apiName: 'authapi',
        path: `/subs/${username}`,
        options: {
          headers: { Authorization: authToken }
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

  async function getAllLocationData() {
    var jsonLocations = await getLocations();
    var locationList = formatLocations(jsonLocations, false);

    if (isLoggedIn()) {
      jsonLocations = await getUserSensors();
      var userLocations = formatLocations(jsonLocations, true);
      // Filter out duplicates (i.e. sensors that are both public and user)
      locationList = locationList.filter(location => {
        var isDuplicate = false;
        userLocations.forEach(uLocation => {
          if (location.sensorID === uLocation.sensorID)
            isDuplicate = true;
        })
        return !isDuplicate;
      })
      locationList = locationList.concat(userLocations);
    }

    setLocations(locationList);
  }

  return (
    <div className="App">
      <SimpleDialog open={dialogOpen} onClose={closeDialog} title="Action Status" message={dialogMessage} />
      <Header username={getUsername()} authStatus={isLoggedIn()} signOut={signOut} menuIconAction={handleDrawer} />
      <Drawer open={showDrawer} onClose={handleDrawer}
        sx={{
          '& .MuiDrawer-paper': {
            top: `${appBarHeight}px`, // Start below the AppBar
            height: `calc(100% - ${appBarHeight}px)`, // Adjust height to fit below AppBar
          }
        }}>
        {isLoggedIn() && <UserDevices submitAction_2={putLocation} submitAction_3={addSubscription} submitAction_4={cancelSub} queryAction={querySub} />}
      </Drawer>
      <Map
        key={'map'}
        locations={locations}
        getLocationData={getLocationData}
      />
    </div>
  );
}

export default App;

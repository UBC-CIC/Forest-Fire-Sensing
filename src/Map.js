import { useRef, useState } from "react";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from 'leaflet';
import DataDashboard from "./DataDashboard";
delete L.Icon.Default.prototype._getIconUrl;

const defaultMarker = new L.Icon({
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),

  iconSize:    [25, 41],
  iconAnchor:  [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize:  [41, 41]
})

const greenMarker = new L.Icon({
  iconUrl: require('./icons/green-marker.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),

  iconSize:    [25, 41],
  iconAnchor:  [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize:  [41, 41]
});

function Map({ locations, getLocationData }) {
  const mapRef = useRef(null);
  const latitude = 49.25;
  const longitude = -123.15;

  const [locationData, setLocationData] = useState();
  const [isDataResolved, setIsDataResolved] = useState(false);

  const appBarHeight = 64; // Typically 64px for desktop AppBar

  async function retrieveData(dataPromise) {
    setIsDataResolved(false);
    let data = await dataPromise;
    setLocationData(data);
    console.log(data);
    setIsDataResolved(true);
  }

  function addMarkers(locations) {
    if (locations == null) {
      return;
    }
    return (
      <>
        {locations.map((location) => (
          <Marker position={[location.lat, location.lon]} key={[location.lat, location.lon]} icon={location.isUser ? greenMarker : defaultMarker} eventHandlers={{ click: () => { retrieveData(getLocationData(location)) } }}/>
        ))}
        {isDataResolved && <DataDashboard data={locationData} />}
      </>
    );
  }
  return (
    <MapContainer center={[latitude, longitude]} zoom={13} ref={mapRef} style={{ top: `${appBarHeight}px`, height: `calc(100vh - ${appBarHeight}px)`, width: "100%", zIndex: 0 }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {addMarkers(locations)}
    </MapContainer>
  );
}

export default Map;
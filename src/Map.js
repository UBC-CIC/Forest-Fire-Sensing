import { useRef, useState } from "react";
import { MapContainer, Popup, TileLayer, Marker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from 'leaflet';
import FWIVis from "./FWIVis";
import { Loader } from "@aws-amplify/ui-react";
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

function Map({ locations, getLocationData }) {
  const mapRef = useRef(null);
  const latitude = 49.25;
  const longitude = -123.15;

  const [showVisuals, setShowVisuals] = useState(false);
  const [locationData, setLocationData] = useState();
  const [isDataResolved, setIsDataResolved] = useState(false);

  function showGraph(show) {
    setShowVisuals(show);
  }

  async function retrieveData(dataPromise) {
    setIsDataResolved(false);
    let data = await dataPromise;
    setLocationData(data);
    setIsDataResolved(true);
  }

  function addMarkers(locations) {
    if (locations == null) {
      return;
    }
    return (
      <>
        {locations.map((location) => (
          <Marker position={location} key={location} eventHandlers={{ click: () => { retrieveData(getLocationData(location)) } }}>
            <Popup>
              {!isDataResolved && <Loader size="large" variation="linear"/>}
              {(showVisuals && isDataResolved) && <FWIVis FWIdata={locationData} />}
              {isDataResolved && <button onClick={() => showGraph(!showVisuals)}>See As {showVisuals ? "Table" : "Graph"}</button>}
            </Popup>
          </Marker>
        ))}
      </>
    );
  }
  return (
    <MapContainer center={[latitude, longitude]} zoom={13} ref={mapRef} style={{ height: "92vh", width: "100%", zIndex: 0 }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {addMarkers(locations)}
    </MapContainer>
  );
}

export default Map;
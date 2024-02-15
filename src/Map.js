import { useRef } from "react";
import { MapContainer, Popup, TileLayer, Marker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from 'leaflet';
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

function addMarkers(locationData) {
  if(locationData == null){
    return;
  }
  console.log(locationData.length);
  return (
    <>
      {locationData.map((location) => (
        <Marker position={location[0]}>
          <Popup>
            {location[1]}
          </Popup>
        </Marker>
      ))}
    </>
  );
}

function Map({ locationData }) {
  const mapRef = useRef(null);
  const latitude = 49.25;
  const longitude = -123.15;

  return (
    <MapContainer center={[latitude, longitude]} zoom={13} ref={mapRef} style={{ height: "82vh", width: "99vw", zIndex: 0 }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {addMarkers(locationData)}
    </MapContainer>
  );
}

export default Map;
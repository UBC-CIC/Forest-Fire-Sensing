import {useRef} from "react";
import { MapContainer, Popup, TileLayer, Marker } from "react-leaflet";
import "leaflet/dist/leaflet.css";

function Map({coordinates, fireData, json}) {
    const mapRef = useRef(null);
    const latitude = 49.25;
    const longitude = -123.15;

    return ( 
        <MapContainer center={[latitude, longitude]} zoom={13} ref={mapRef} style={{height: "82vh", width: "99vw"}}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {(json !== "") && (
              <Marker position={coordinates}>
                <Popup>
                  {fireData}
                </Popup>
              </Marker>
          )}
        </MapContainer>
    );
}

export default Map;
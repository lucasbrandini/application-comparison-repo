import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import style from './Card.module.css';

const containerStyle = {
  width: '100%',
  height: '100%'
};

const center = {
  lat: -34.397,
  lng: 150.644
};

export function Card() {
  return (
    <div className={style.card}>
      {/* <p>a</p> */}
      <LoadScript
        googleMapsApiKey="AIzaSyAdxIG67xrVviqqJWnZEwxU28iLh8lQG1o"
      >
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          zoom={8}
        >
          <Marker position={center} />
        </GoogleMap>
      </LoadScript>
    </div>
  );
}
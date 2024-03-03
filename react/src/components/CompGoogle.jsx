import { GoogleMap, useLoadScript, Marker } from '@react-google-maps/api';

import React from 'react'

const CompGoogle = () => {
    const libraries = ['places'];
    const mapContainerStyle = {
        top: '5vh',
        left: '17vw',
        width: '70vw',
        height: '70vh',
    };
    const center = {
        lat: -20.8202, // latitude for São José do Rio Preto
        lng: -49.3797, // longitude for São José do Rio Preto
    };
    const { isLoaded, loadError } = useLoadScript({
        googleMapsApiKey: 'AIzaSyAdxIG67xrVviqqJWnZEwxU28iLh8lQG1o',
        libraries,
      });
    
      if (loadError) {
        return <div>Error loading maps</div>;
      }
    
      if (!isLoaded) {
        return <div>Loading maps</div>;
      }

  return (
    <div>        
        <GoogleMap
            mapContainerStyle={mapContainerStyle}
            zoom={10}
            center={center}
        >
            <Marker position={center} />
        </GoogleMap>
    </div>
  )
}

export default CompGoogle
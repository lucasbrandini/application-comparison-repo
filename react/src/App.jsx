import { useState } from 'react'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { Header } from './components/Header.jsx'; 
import { Main } from './components/Main.jsx';
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import { GoogleMap, useLoadScript, Marker } from '@react-google-maps/api';

import './global.css';
import styles from './App.module.css'

const libraries = ['places'];
const mapContainerStyle = {
  width: '100vw',
  height: '100vh',
};
const center = {
  lat: -23.5505, // latitude for São Paulo
  lng: -46.6333, // longitude for São Paulo
};

export function App() {
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
    <Router>
      <Header />
      <Main />
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        zoom={10}
        center={center}
      >
        <Marker position={center} />
      </GoogleMap>
    </Router>
    
  )
}


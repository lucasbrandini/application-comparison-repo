import { useState } from 'react'
import style from './App.module.css'
import { Card } from './components/Card' // Certifique-se de que o caminho para o arquivo Card.jsx está correto

export function App() {
  const imageUrl = "https://images.unsplash.com/photo-1682687982107-14492010e05e?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDF8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"; // Substitua por sua URL de imagem

  return (
    <>
      <div>
        <h1>Hello!</h1>
        <Card image={imageUrl} />
      </div>
    </>
  )
}
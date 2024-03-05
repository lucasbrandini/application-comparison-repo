import style from './Search.module.css'
import { useState } from 'react'

export function Search() {
  const [searchTxt, setTxt] = useState ('')

  const clickEvent = () => {
    setTxt(SearchInput.value)
  }

  return (
    <>
      <div>
        <input id='SearchInput' placeholder="Digite o texto desejado aqui" type='text' className={style.input} />
        <button onClick = {clickEvent} >🔎</button>
        <h2>{searchTxt}</h2>
      </div>
    </>
  )
}
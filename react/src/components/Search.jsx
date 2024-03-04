import style from './Search.module.css'

export function Search() {
  return (
    <>
      <div>
        <input placeholder="Digite o texto desejado aqui" type='text' className={style.input} />
      </div>
    </>
  )
}
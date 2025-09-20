import React from 'react'
import "./SubHeader.css"
import Link from 'next/link'


export default function SubHeader({ text, showLink, linkText = "Show More", url = "/"}) {
  return (
    <div className='subHeader-container '>
      <h1>{text}</h1>
      {showLink && <Link href={url}>{linkText}</Link>}
    </div>
  )
}

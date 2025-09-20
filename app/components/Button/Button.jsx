

import React from 'react'
import "../../globals.css"
import "./Button.css"
export default function Button({children, onClick, className , disabled}) {
  return (
    <button onClick={onClick} className={className} disabled={disabled}>{children}</button>
  )
}

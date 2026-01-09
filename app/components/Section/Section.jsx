"use client"

import React, { useEffect, useState } from 'react'
import SubHeader from '../subHeader/SubHeader'
import ProductCarousel from '../ProductCarousel/ProductCarousel'
import apiFetch from '@/app/services/apiFetchService'
import { useLoading } from '@/app/context/LoadingContext'

export default function Section({ category, headerText, showLink, linkText }) {
  const { setLoading } = useLoading();
  const [url, setUrl] = useState(""); // <-- use state

  useEffect(() => {
    const fetchCategory = async () => {

      try {
        if (category?.length > 0 && category!="" ) {
          setLoading(true)
          const res = await apiFetch(`/categories/byname/${category}`)
          console.log("Fetched category:", res)

          if (res != null && showLink === true) {
            setUrl(`/category/${res.id}?name=${res.name}`)
          }
        }
      } catch(err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchCategory()
  }, [category])


  return (
    <div className='section-container'>
        <SubHeader text={headerText} showLink={showLink} linkText={linkText} url={url}/>
        <ProductCarousel category={category}/>
    </div>
  )
}

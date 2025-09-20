"use client"

import React, { useEffect, useState } from 'react'
import Pagination from '../components/Pagination/Pagination';
import "./products.css"
import Filter from '../components/Filter/Filter';
import SubHeader from '../components/subHeader/SubHeader';
import Categories from '../components/Categories/Categories';
import { useSearchParams } from "next/navigation";
import apiFetch from '../services/apiFetchService';
import { useLoading } from '../context/LoadingContext';


export default function Products() {
 
 
  const [selectedFilter , setSelectedFilter] = useState(1);
  const [categories ,setCategories] = useState([]);
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("البحث-عن");  

  const {setLoading} = useLoading();
  useEffect(() => {
    if (searchQuery) {
      console.log("Searching for:", searchQuery);
    }
  }, [searchQuery]);

  useEffect(() => {
        const fetchCategories = async () => {
          setLoading(true)
          const top10Categories = await apiFetch("/categories/top");
          setCategories(top10Categories);
          setLoading(false)
    };
    fetchCategories();
  },[])

  return (
    <div className='products-container'>
      <div>
        <SubHeader text="الأقسام" showLink={false} />
        <Categories categories={categories} />
        <Filter selectedFilter={selectedFilter} setSelectedFilter={setSelectedFilter} />

        <Pagination selectedFilter={selectedFilter} outerSearchQuery={searchQuery} />
      </div>
    </div>
  )
}

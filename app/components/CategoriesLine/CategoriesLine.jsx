"use client"


import { useState, useEffect } from "react";
import apiFetch from "../../services/apiFetchService";
import { useLoading } from "@/app/context/LoadingContext";
import Categories from "../Categories/Categories";
import SubHeader from "../subHeader/SubHeader";

export default function CategoriesLine() {

    const {setLoading } = useLoading();


    const [categories ,setCategories] = useState([])
    useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      try {
        const top10Categories = await apiFetch("/categories/top");
        setCategories(top10Categories);
      } catch (err) {
        console.error("--Error fetching categories:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [setLoading]);


  return       <div style={{marginTop:"2rem"}} className="category-line-container">
          <SubHeader text="الأقسام" showLink={false} />
    
<Categories categories={categories} />
  </div>

}
"use client"

import React, { useState } from 'react'
import "./dashboard.css"
import Button from '../components/Button/Button'
import Filter from '../components/Filter/Filter'
import Pagination from '../components/Pagination/Pagination'
import DashboardProduct from '../components/DashboardComponents/DashboardProduct/DashboardProduct'
import Link from 'next/link'
import DashboardUser from '../components/DashboardComponents/dashboardUser/DashboardUser'
import DashboardCategory from '../components/DashboardComponents/DashboardCategory/DashboardCategory'
import apiFetch from '../services/apiFetchService'
import { useAuth } from '../context/AuthContext'
import { useLoading } from '../context/LoadingContext'


export default function Dashboard() {
  

    const [section ,setSection] = useState("products");
  const {setToast} = useAuth();
    const [selectedFilter , setSelectedFilter] = useState(1);
  const {setLoading} = useLoading(); 

const handleUpdatePrices = async () => {
  const confirmed = window.confirm("هل انت متأكد انك تريد تحديث جميع اسعار وكميات منتجات شي ان؟");

  if (!confirmed) return; // user canceled

  try {
    setLoading(true)
    const response = await apiFetch("/Product/upadte-all-shein-price",{}, false);

    if (response.isSuccess) {
            setToast({ show: true, message: "تم تحديث المنتجات بنجاح!" });
            setLoading(false)
setTimeout(() => {
                  window.location.reload();

},1500)


    }  else {
            setToast({ show: true, message: "فشلت تحديث المنتجات", error: true });

    }

  } catch (error) {
    
      setToast({show:true,message:`${err?.message}: فشلت عملية تحديث المنتجات` })
  } finally{
    setLoading(false)
  }
};


  const productsListComponent = <> 
<div className='main-dashboard-buttons-container'>

    <Button >
    <Link   href={"/dashboard/add-update-product/0"}>اضافة منتج جديد</Link>
    </Button>

      <Button>
    <Link  href={"/dashboard/addSheinProduct"}>اضافة منتج  شي ان جديد</Link>
    </Button>
    {/* <Button onClick={() => handleUpdatePrices()}>تحديث جميع اسعار وكميات منتجات شي ان</Button> */}
</div>
  <Filter selectedFilter={selectedFilter} setSelectedFilter = {setSelectedFilter}  />
  
        <Pagination selectedFilter={selectedFilter} ProductComponent={DashboardProduct} onlyActiveProducts= {false}  />
  
  </>


const usersListComponent = <DashboardUser/>

const categoriesListComponent = <DashboardCategory/>
  

const ComponentsSections = {
    "products" : productsListComponent,
    "users" : usersListComponent,
    "categories": categoriesListComponent
  }

  const component = ComponentsSections[section];
  

  
  return (
    <main className='dashboard-container'>


   <aside>

<div>

  <Button onClick={() => setSection("products")}>
Products
</Button>

<Button  onClick={(e) => setSection("users")}>
Users
</Button>

<Button  onClick={(e) => setSection("categories")}>
Categories
</Button>

</div>

   </aside>

   <div className='dashboard-content'>
    {component}
   </div>
    
    
    </main>
  )
}

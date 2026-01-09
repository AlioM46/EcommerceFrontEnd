import React, { useEffect, useState } from 'react';
import "./CategoryCard.css";
import Link from 'next/link';
import { getImageSrc } from '@/app/utils/handleUrls';

export default function CategoryCard({ Category }) {
    // destructure id, name, full_img_url from Category
    const { id, name, full_img_url } = Category;



    return (
<Link href={`/category/${id}?name=${name}`}>
            <div className="category-container">
                <div className='category-image-holder'>
                    <img src={full_img_url} alt={`Category ${name}`} />
                </div>
                <h3>{name}</h3>
            </div>
        </Link>
    );
}

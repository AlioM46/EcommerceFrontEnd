import React, { useEffect, useState } from 'react';
import "./CategoryCard.css";
import Link from 'next/link';
import { getImageSrc } from '@/app/utils/handleUrls';

export default function CategoryCard({ Category }) {
    // destructure id, name, imgUrl from Category
    const { id, name, imgUrl } = Category;

    const [resolvedImage , setResolvedImage] = useState();

    useEffect(() => {


        const fetchImage = async () => {
                if(!imgUrl) return;
                setResolvedImage(await getImageSrc(imgUrl)) 
        }
        fetchImage();

    },[imgUrl])


    return (
<Link href={`/category/${id}?name=${name}`}>
            <div className="category-container">
                <div className='category-image-holder'>
                    <img src={resolvedImage} alt={`Category ${name}`} />
                </div>
                <h3>{name}</h3>
            </div>
        </Link>
    );
}

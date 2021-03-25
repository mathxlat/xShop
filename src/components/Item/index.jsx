import React from "react";
import { Link } from "react-router-dom";
import './Item.scss'


function FormatNumber(number) {
    return (
(number) ? 
    <span style={{ color: "green" }}>
        {new Intl.NumberFormat("ES-AR", {
        style: "currency",
        currency: "ARS"
        }).format(number)}
    </span>
    : null
    );
}

const Item = ({item})=> {
    return (
        <Link to={`/item/${item.id}`} className="link-styles">
            <div className="item">
                <div className="item-contain">
                    <div className="item-image-contain">
                    <div className="img-item">
                        <img src={item.img} alt=""/>
                    </div>
                    </div>
                    <div className="item-content">
                    <div className="name-item">
                        <h3>{item.name}</h3>
                    </div>
                    <div className="price-item">
                        <p>{FormatNumber(item.price)}</p>
                    </div>
                    <div className="desc-item">
                        <p>{item.desc}</p>
                    </div>
                    </div>
                </div>
            </div>
        </Link>
    )
}

export default Item;
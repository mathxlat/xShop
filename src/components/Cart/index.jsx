import React, { useContext, useEffect, useState } from 'react';
import CartItem from '../CartItem'
import { Link } from "react-router-dom";
import './Cart.scss'
import { CartContext } from "../../context/CartContext";
import {Loading} from '../Loading'
import firebase from 'firebase/app'
import 'firebase/firestore'
import {getFirestore} from '../../firebase'
const onClickUp = () => {
    window.scrollTo(0,0)
}

const FormatNumber = (number) => {
    return (
(number) ? 
    <span style={{ color: "#000" }}>
        {new Intl.NumberFormat("ES-AR", {
        style: "currency",
        currency: "ARS"
        }).format(number)}
    </span>
    : null
    );
}

const Cart = ()=>{
    const [loading, setLoading] = useState(true)
    const [finishBuy, setFinishBuy] = useState(false)
    const [nombre, setNombre] = useState(null)
    const [apellido, setApellido] = useState(null)
    const [telefono, setTelefono] = useState(null)
    const [mail, setMail] = useState(null)

    const {cart,clear,cartLength,cartPrice} = useContext(CartContext);
    useEffect(()=>{
        setLoading(false)
        return(()=>{
            onClickUp()
            setLoading(true)
        })
    },[])
    const generateOrder = ()=>{
        const db = getFirestore();
        const orders = db.collection("orders")
        let orden = {}
        orden.date = firebase.firestore.Timestamp.fromDate(new Date())
        orden.buyer = {name: `${nombre} ${apellido}`, phone: telefono, email: mail}
        orden.total = cartPrice
        orden.items = cart.map(cartItem => {
            const id = cartItem.item.id;
            const name = cartItem.item.name;
            const price = cartItem.item.price * cartItem.quantity;
            const quantity = cartItem.quantity;
            return {id,name,price,quantity}
        })
        orders.add(orden).then(({id})=>{console.log(`Ticket de orden generada: ${id}`)}).catch( err => {console.log(err)}).finally(()=>{console.log('Orden enviada')})
        const itemsToUpdate = db.collection('items').where(
            firebase.firestore.FieldPath.documentId(), 'in', cart.map(i => i.item.id)
        )
        const batch = db.batch()
        itemsToUpdate.get().then(collection=>{
            collection.docs.forEach(docSnapshot => {
                batch.update(docSnapshot.ref,{
                    stock: docSnapshot.data().stock - cart.find(item => item.item.id === docSnapshot.id).quantity
                })
            })
            batch.commit()
        })
    }
    if(loading) return <Loading />
    return(
        (cartLength !== 0) ? (
            (!finishBuy) ? (
            <div className="container-cart">
            <h1>Carrito de compras</h1>
            <div className="container-cart-items">
            {cart.map((items)=> <CartItem key={items.item.id} items={items}/>)}
            </div>
            <div className="cart-contain-info-items">
                <div className="btn-clear-cart">
                    <button onClick={()=> clear()}>Limpiar Carrito</button>
                </div>  
                <div className="cart-info-items-total">
                    <p>Cantidad de productos: {cartLength}</p>
                    <p>Total: {FormatNumber(cartPrice)}</p>
                </div>
            </div>
                <div className="cart-buy-items">
                    <button onClick={()=> setFinishBuy(!finishBuy)}>Comprar</button>
                </div>
        </div>) : (
        <div className="container-cart">
            <div className="cart-finish-buy">
            <h1>Finalizar compra</h1>
                <div className="form-buy-container">
                    <form id="form-finish-buy" onSubmit={e=>{e.preventDefault();generateOrder();}}>
                        <p>Nombre:</p>
                        <input type="text" id="nombre" minLength="3" maxLength="15" required onChange={(nombre)=>setNombre(nombre.target.value)}/>
                        <p>Apellido:</p>
                        <input type="text" id="apellido" minLength="3" maxLength="15" required onChange={(apellido)=>setApellido(apellido.target.value)}/>
                        <p>Número:</p>
                        <input type="number" id="numero" min="0" max="9999999999" required onChange={(telefono)=>setTelefono(telefono.target.value)}/>
                        <p>Mail de contacto:</p>
                        <input type="email" id="email" required onChange={(mail)=>setMail(mail.target.value)}/>
                    </form>
                </div>
                <div className="finish-buy-end">
                    <button type="submit" form="form-finish-buy" className="btn-finish-buy">Finalizar compra</button>
                </div>
            </div>
        </div>
        ) ) 
        : (
            <div className="container-cart-empty">
                <h1>Tu carrito está vacío</h1>
                <Link to='/'>Volver a Inicio</Link>
            </div>
        )
    )
}
export default Cart;
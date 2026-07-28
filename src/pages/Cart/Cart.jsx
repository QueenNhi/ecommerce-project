import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { useAuth } from "../../context/AuthContext";
import { API_URL, UPLOADS_URL } from "../../config/api";

import "./Cart.css";


function Cart() {

    const { user } = useAuth();
    const userId = user?.id || 1;

    const navigate = useNavigate();


    const [cartItems, setCartItems] = useState([]);

    const [loading, setLoading] = useState(true);




    // ==========================
    // LOAD CART
    // ==========================

    const loadCart = async () => {


        try {


            const response = await fetch(

                `${API_URL}/api/cart/${userId}`

            );


            const data = await response.json();



            if(Array.isArray(data)){

                setCartItems(data);

            }

            else{

                setCartItems([]);

            }



        }

        catch(err){


            console.error(
                "Load cart error:",
                err
            );


            setCartItems([]);


        }


        finally{


            setLoading(false);


        }


    };





    useEffect(()=>{


        loadCart();


    },[user]);







    // ==========================
    // UPDATE QUANTITY
    // ==========================


    const updateQuantity = async(id, quantity)=>{


        if(quantity < 1){

            return;

        }



        try{


            await fetch(

                `${API_URL}/api/cart/update`,

                {

                    method:"PUT",

                    headers:{


                        "Content-Type":
                        "application/json"


                    },


                    body:JSON.stringify({

                        id,

                        quantity

                    })

                }

            );



            loadCart();


        }

        catch(err){


            console.error(err);


        }


    };







    // ==========================
    // REMOVE ITEM
    // ==========================


    const removeItem = async(id)=>{


        try{


            await fetch(

                `${API_URL}/api/cart/remove/${id}`,

                {

                    method:"DELETE"

                }

            );


            loadCart();


        }

        catch(err){


            console.error(err);


        }


    };







    // ==========================
    // CLEAR CART
    // ==========================


    const clearCart = async()=>{


        try{


            await fetch(

                `${API_URL}/api/cart/clear/${userId}`,

                {

                    method:"DELETE"

                }

            );


            loadCart();


        }

        catch(err){


            console.error(err);


        }


    };








    const formatPrice=(price)=>{


        return Number(price)

        .toLocaleString("vi-VN")

        +" ₫";


    };








    // FIX PRICE STRING FROM POSTGRESQL


    const subtotal = cartItems.reduce(

        (total,item)=>

            total +

            Number(item.price)

            *

            Number(item.quantity),

        0

    );




    const shipping = 0;


    const total = subtotal + shipping;








    if(loading){


        return (

            <>

                <Header/>


                <div className="cart-loading">

                    Loading...

                </div>


                <Footer/>


            </>

        );


    }









    return (

        <>


        <Header/>



        <div className="cart-page">


            <div className="cart-container">



                <div className="cart-title">


                    <h1>

                        Shopping Cart

                    </h1>


                    <p>

                        {cartItems.length} sản phẩm

                    </p>



                </div>






                {
                    cartItems.length===0

                    ?

                    (

                    <div className="empty-cart">


                        <h2>

                            Giỏ hàng đang trống

                        </h2>


                        <p>

                            Hãy khám phá thêm sản phẩm.

                        </p>



                        <Link

                            to="/shop"

                            className="continue-btn"

                        >

                            Continue Shopping


                        </Link>



                    </div>

                    )

                    :

                    (



                    <div className="cart-wrapper">



                        <div className="cart-left">



                            <table className="cart-table">


                                <thead>

                                    <tr>

                                        <th>
                                            Product
                                        </th>


                                        <th>
                                            Price
                                        </th>


                                        <th>
                                            Quantity
                                        </th>


                                        <th>
                                            Total
                                        </th>


                                        <th>

                                        </th>


                                    </tr>


                                </thead>




                                <tbody>


                                {

                                    cartItems.map(item=>(


                                    <tr key={item.id}>


                                        <td>


                                            <div className="product-info">


                                                <img


                                                    src={

                                                    `${UPLOADS_URL}/${item.image_url}`

                                                    }


                                                    alt={item.name}


                                                />



                                                <div>


                                                    <h4>

                                                        {item.name}

                                                    </h4>



                                                    <p>

                                                        Color:
                                                        {" "}
                                                        {item.color_name}

                                                    </p>


                                                    <p>

                                                        Size:
                                                        {" "}
                                                        {item.size_name}

                                                    </p>



                                                </div>


                                            </div>



                                        </td>




                                        <td>

                                            {formatPrice(item.price)}

                                        </td>




                                        <td>


                                            <div className="quantity-box">


                                                <button

                                                    onClick={()=>updateQuantity(

                                                        item.id,

                                                        item.quantity-1

                                                    )}

                                                >

                                                    -

                                                </button>




                                                <span>

                                                    {item.quantity}

                                                </span>




                                                <button


                                                    onClick={()=>updateQuantity(

                                                        item.id,

                                                        item.quantity+1

                                                    )}


                                                >

                                                    +

                                                </button>



                                            </div>



                                        </td>




                                        <td>


                                            {
                                                formatPrice(

                                                    Number(item.price)

                                                    *

                                                    item.quantity

                                                )

                                            }



                                        </td>




                                        <td>


                                            <button


                                                className="delete-btn"


                                                onClick={()=>removeItem(item.id)}


                                            >

                                                ×


                                            </button>



                                        </td>




                                    </tr>


                                    ))


                                }


                                </tbody>



                            </table>




                        </div>






                        <div className="cart-right">



                            <div className="summary-card">



                                <h2>

                                    Order Summary

                                </h2>




                                <div className="summary-row">


                                    <span>

                                        Subtotal

                                    </span>


                                    <span>

                                        {formatPrice(subtotal)}

                                    </span>


                                </div>




                                <div className="summary-row">


                                    <span>

                                        Shipping

                                    </span>


                                    <span>

                                        Free

                                    </span>


                                </div>




                                <div className="summary-row total">


                                    <span>

                                        Total

                                    </span>


                                    <span>

                                        {formatPrice(total)}

                                    </span>


                                </div>





                                <button


                                    className="checkout-btn"


                                    onClick={()=>navigate("/checkout")}


                                >

                                    Proceed To Checkout


                                </button>





                                <button


                                    className="clear-btn"


                                    onClick={clearCart}


                                >

                                    Clear Cart


                                </button>





                                <Link


                                    to="/shop"


                                    className="continue-btn"


                                >

                                    Continue Shopping


                                </Link>




                            </div>



                        </div>





                    </div>



                    )

                }




            </div>


        </div>





        <Footer/>

        </>


    );


}



export default Cart;
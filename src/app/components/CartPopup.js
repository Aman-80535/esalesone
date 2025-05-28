import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import "../styles/CartPopup.css"
import { decrementQuantity, incrementQuantity, removeFromCart } from "@/redux/cart/cartAction";
import { useRouter } from "next/navigation";


const CartPopup = ({ setIsOpen, isOpen, togglePopup }) => {
  const dispatch = useDispatch();
  const { items, error, loading } = useSelector((state) => state.cart);
  const { userData } = useSelector((state) => state.user);
  const closePopup = () => setIsOpen(false);
  const router = useRouter();


  if (error) {
    console.log(error.message)
  }
  const handleDecrement = async (itemID) => {
    try {
      dispatch(decrementQuantity(itemID))
    }
    catch (error) {
      console.log(error.message)
    }
  }

  const handleIncrement = async (itemID) => {
    try {
      await dispatch(incrementQuantity(itemID))
    }
    catch (error) {
      console.log(error.message)
    }
  }

  const removeItemFromCart = async (itemID) => {
    try {
      await dispatch(removeFromCart(itemID))
    }
    catch (error) {
      console.log(error.message)
    }
  }

  function toOrderPage(){
    togglePopup();
    router.push('/order')
  }




  return (
    <div className="position-relative">
      {isOpen && (
        <div className="cart-popup" onClick={closePopup}>

          {/* Loader overlay */}
          {loading && (
            <div className="position-absolute top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center bg-white bg-opacity-50" style={{ zIndex: 999 }}>
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          )}
          <div
            className="cart-popup-content z-10 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <h4>Your Cart</h4>
            {userData ? (
              <>
                {items?.map((item) => (
                  <div key={item?.id} style={{ padding: "0px 0px 18px" }}>
                    <hr />
                    <div>
                      <img
                        src={item?.image}
                        alt=""
                        width="50px"
                        height="70px"
                        className="float-start"
                      />
                    </div>
                    <p>{item.title}</p>
                    <div>
                      <button
                        style={{ float: "right", color: "black" }}
                        onClick={() => removeItemFromCart(item.id)}
                      >
                        X
                      </button>
                      <p>${item.price}</p>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        gap: "8px",
                        justifyContent: "center",
                      }}
                    >
                      <button
                        style={{ background: "#ce88a8" }}
                        onClick={() => handleDecrement(item.id)}
                      >
                        -
                      </button>
                      <button style={{ background: "grey" }}>{item.quantity}</button>
                      <button onClick={() => handleIncrement(item.id)}>+</button>
                    </div>
                  </div>
                ))}
                <hr />
            {items?.length > 0 && 
               <p>
               Total: $
               {items?.reduce((total, item) => total + item.quantity * item.price, 0)}
             </p>
            } 
              </>
            ) : (
              <div>Please Login...</div>
            )}


            <div className="d-flex gap-4 align-text-center px-4">

              <button onClick={togglePopup}>Close</button>
              {items?.length > 0 &&  <button onClick={toOrderPage}>Order Now</button>} 
            </div>


          </div>
        </div>
      )
      }
    </div >
  );
};

export default CartPopup;

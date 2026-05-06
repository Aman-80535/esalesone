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

  // track selected image index per item id
  const [selectedMap, setSelectedMap] = useState({});

  const selectImage = (itemId, idx) => {
    setSelectedMap((s) => ({ ...s, [itemId]: idx }));
  };


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

  function toOrderPage() {
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
            className="cart-popup-content z-10 relative overflow-y-auto h-screen tailwind-scrollbar-hide"
            onClick={(e) => e.stopPropagation()}
          >
            <h4>Your Cart</h4>
            {userData ? (
              <>
                {items?.map((item) => (
                  <div key={item?.id} className="cart-item">
                    <div>
                      <div className="cart-thumb">
                        <img src={(item.images && item.images.length) ? item.images[selectedMap[item.id] || 0] : item.image} alt={item?.title} />
                      </div>
                      {(item.images && item.images.length > 1) && (
                        <div className="cart-thumb-list">
                          {item.images.map((src, i) => (
                            <img
                              key={i}
                              src={src}
                              alt={`thumb-${i}`}
                              className={selectedMap[item.id] === i ? 'selected' : ''}
                              onClick={() => selectImage(item.id, i)}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="cart-details">
                      <p className="cart-title">{item.title}</p>
                      <div className="cart-meta">Size: <b>{item?.size || '-'}</b></div>
                      <div className="cart-meta">Price: <b>Rs. {item.price}</b></div>

                      <div className="cart-actions">
                        <button className="qty-btn" onClick={() => handleDecrement(item.id)}>-</button>
                        <div className="qty-display">{item.quantity}</div>
                        <button className="qty-btn" onClick={() => handleIncrement(item.id)}>+</button>
                        <button className="remove-btn" onClick={() => removeItemFromCart(item.id)}>Remove</button>
                      </div>
                    </div>
                  </div>
                ))}

                <div className="cart-footer">
                  <div className="cart-total">
                    <span>Total</span>
                    <span>₹{items?.reduce((total, item) => total + item.quantity * item.price, 0)}</span>
                  </div>

                  <div className="cta-row">
                    <button className="btn-ghost" onClick={togglePopup}>Close</button>
                    {items?.length > 0 && <button className="btn-primary-cta" onClick={toOrderPage}>Order Now</button>}
                  </div>
                </div>
              </>
            ) : (
              <div>Please Login...</div>
            )}


          </div>
        </div>
      )
      }
    </div >
  );
};

export default CartPopup;

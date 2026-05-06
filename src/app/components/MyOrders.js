'use client'
import { useLoader } from '@/context/LoaderContext';
import { fetchUserOrders } from '@/redux/cart/cartAction';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Loader from './common/Loader';

const OrderHistory = () => {
  const { orderList, loading } = useSelector((state) => state.cart);
  const dispatch = useDispatch();
  const { setLoading } = useLoader()
  const [selectedImageMap, setSelectedImageMap] = useState({});


  console.log(orderList, "orderlist")
  useEffect(() => {
    setLoading(true);
    const fetchData = async () => {
      dispatch(fetchUserOrders());
      setLoading(false);
    };

    fetchData();
  }, [dispatch]);


  return (
    <div className="container mt-4">
      <h2>Your Orders</h2>
      {loading && <Loader />}

      {orderList?.length === 0 && !loading ? <p>No orders yet.</p>
        : orderList?.map((order) => (
          <div className="card mb-3" key={order.id}>
            <div className="card-body">
              <h5 className="card-title">Order ID: {order.id}</h5>
              <p className="card-text">
                Date: {order?.date ? (moment(order.date).format('dddd, DD/MM/YYYY - hh:mm A')) : ""}
              </p>
              <p>Status: Success</p>
              <p className="card-text">
                Payment Status: <span className={`${order?.payment ? 'text-success fw-bold' : 'text-danger fw-bold'}`}>{order?.payment ? "✅ Approved Transaction" : 'Pending'}</span>
              </p>
              <div className="row">
                {order?.items?.map((item) => (
                  <div className="col-md-4 mb-3" key={item.id}>
                    <div className="card">
                      {(() => {
                        const imgs = Array.isArray(item?.images) && item.images.length ? item.images : (item?.image ? [item.image] : []);
                        const selectedIndex = selectedImageMap[item.id] || 0;
                        const mainSrc = imgs.length ? (imgs[selectedIndex] || imgs[0]) : '/placeholder.png';
                        return (
                          <>
                            <img
                              src={mainSrc}
                              alt={item.name}
                              className="card-img-top"
                              style={{ height: '100px', objectFit: 'cover' }}
                            />
                            {imgs.length > 1 && (
                              <div style={{ display: 'flex', gap: 6, padding: 8, justifyContent: 'center' }}>
                                {imgs.map((src, idx) => (
                                  <img
                                    key={idx}
                                    src={src}
                                    alt={`${item.name}-${idx}`}
                                    onClick={() => setSelectedImageMap(prev => ({ ...prev, [item.id]: idx }))}
                                    style={{ width: 36, height: 36, objectFit: 'cover', borderRadius: 6, cursor: 'pointer', border: selectedImageMap[item.id] === idx ? '2px solid #0ea5a0' : '1px solid rgba(0,0,0,0.08)' }}
                                  />
                                ))}
                              </div>
                            )}
                          </>
                        )
                      })()}
                      <div className="card-body">
                        <h6 className="card-title">{item.name}</h6>
                        <p className="card-text text-muted">₹{item.price.toFixed(2)}</p>
                        <p className="card-text">Quantity: {item.quantity}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-end fw-bold">
                Grand Total: ₹{order.grandTotal.toFixed(2)}
              </div>
            </div>
          </div>
        ))}
    </div>
  );
};

export default OrderHistory;

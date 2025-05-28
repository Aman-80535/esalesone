'use client'

import { useDispatch, useSelector } from "react-redux";
import { logoutUser } from "@/redux/user/userActions";
import { simpleNotify } from "@/utils/common";
import { useRouter } from "next/navigation";
import { useLoader } from "@/context/LoaderContext";

export const MyAccount = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { isLoading, error, userData } = useSelector((state) => state.user);
  const { setLoading } = useLoader()

  const handleLogout = () => {
    setLoading(true);
    dispatch(logoutUser());
    localStorage.removeItem("user_uid");
    router.push("/");
    setLoading(false);
  };

  return (
    <div className="container" style={{ textAlign: "-webkit-center", }}>
      <p>My Account</p>
      <div className="card" style={{
        height: "420px",
        border: "solid dimgray",
        borderRadius: "29px",
        size: "34px",
        width: "50%", width: "40rem",
        fontSize: "13px"
      }}>
        <div className="card-body">
          <p><b>Created By:</b></p>
          <img src="https://avatars.githubusercontent.com/u/90741749?v=4" alt="" style={{
            border: "1px solid",
            borderRadius: "117px"
          }} />
          <h5 className="card-title">{userData?.firstName + userData?.lastName}</h5>
          <button className="btn-primary" onClick={handleLogout} style={{   borderRadius: "44px" }}>Logout</button>
        </div>
      </div>
    </div>
  )
}
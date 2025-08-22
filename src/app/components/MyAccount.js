'use client'

import { useDispatch, useSelector } from "react-redux";
import { logoutUser } from "@/redux/user/userActions";
import { simpleNotify } from "@/utils/common";
import { useRouter } from "next/navigation";
import { useLoader } from "@/context/LoaderContext";
import Link from "next/link";

export const MyAccount = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { isLoading, error, userData, token } = useSelector((state) => state.user);
  const { setLoading } = useLoader();


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
          {!token ? (
            <>
              <Link href="/auth/login" className="text-gray-700 hover:text-blue-600">Login</Link>
            </>
          ) : (
            <>
            <h5 className="card-title">{userData?.firstName + userData?.lastName}</h5>
            <button onClick={handleLogout} className="text-gray-700 hover:text-red-600">
              Logout
            </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
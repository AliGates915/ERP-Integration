import React, { useEffect, useState } from "react";
import gsap from "gsap";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../../context/authSlice";
import { FiLock, FiMail } from "react-icons/fi";
import { Loader } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [loding, setLoding] = useState(false);

  const [password, setPassword] = useState("");
  const [eyeOpen, setEyeclose] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    gsap.from(".login-box", { opacity: 0, y: 50, duration: 1 });
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      setLoding(true)
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/auth/login`,
        { email, password }
      );
  
      const { token, user } = response.data;
  
      // ✅ Merge token with user and save as userInfo
      const userInfo = { ...user, token };
  
      // ✅ Store in Redux (will also store in localStorage via authSlice)
      dispatch(loginSuccess(userInfo));
  
      // ✅ Toast and redirect
      toast.success("Logged in successfully 🎉");
      
  
      if (user.isAdmin === true || user.isAdmin === false) {
        navigate("/admin");
      } else {
        navigate("/");
      }
  
      setTimeout(() => {
        window.location.reload();
      }, 100);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
        error.message ||
        "Login failed. Please try again."
      );
    }
    finally{
      setLoding(false)
    }
  };
  

  return (
    // <div className="min-h-screen flex flex-col lg:flex-row">
    //   {/* Left: Login Form */}
    //   <div className="w-full lg:w-1/2 flex flex-col justify-center items-center bg-white px-6 py-12">
    //     {/* Logo */}
    //     <div className="flex flex-col items-center mb-6">
    //       <div className="w-20 h-20 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xl font-bold mb-2">
    //         Logo
    //       </div>
    //       <h2 className="text-2xl font-semibold mb-2">Login</h2>
    //     </div>
    //     <form onSubmit={handleLogin} className="w-full max-w-sm space-y-4">
    //       <div>
    //         <label className="block text-gray-700 mb-1 font-medium">Email Address</label>
    //         <input
    //           type="email"
    //           className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
    //           value={email}
    //           onChange={(e) => setEmail(e.target.value)}
    //           placeholder="example@gmail.com"
    //           required
    //         />
    //       </div>
    //       <div>
    //         <label className="block text-gray-700 mb-1 font-medium">Password</label>
    //         <input
    //           type="password"
    //           className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
    //           value={password}
    //           onChange={(e) => setPassword(e.target.value)}
    //           placeholder="Password"
    //           required
    //         />
    //       </div>
    //       <button
    //         type="submit"
    //         className="w-full bg-indigo-500 hover:bg-indigo-600 text-white py-2 rounded-md font-semibold transition-all"
    //       >
    //         Login
    //       </button>
    //     </form>
    //     <div className="mt-4 text-center text-sm text-gray-700">
    //       Don't have an account?{" "}
    //       <Link to="/signup" className="text-indigo-600 hover:text-indigo-800 font-medium">
    //         Sign up
    //       </Link>
    //     </div>
    //   </div>
    //   {/* Right: Illustration */}
    //   <div className="hidden lg:flex w-1/2 bg-gray-50 items-center justify-center">
    //     <img
    //       src="/images/login.avif"
    //       alt="Login Illustration"
    //       className="max-w-[80%] h-auto"
    //     />
    //   </div>
    // </div>
<div className="min-h-screen relative bg-[url('/images/erpImage.jfif')] bg-cover bg-center py-6 flex flex-col justify-center sm:py-12">
  {/* Overlay for opacity */}
  <div className="absolute inset-0 bg-black/70"></div> 

  <div className="relative py-3 px-4 sm:px-0 sm:max-w-xl sm:mx-auto">
    {/* Gradient background layer */}
    <div className="hidden sm:block absolute inset-0 bg-gradient-to-r from-newPrimary to-blue-400 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div>

    {/* Main card */}
   <div className="relative px-8 py-14 bg-white shadow-lg sm:rounded-3xl sm:p-20 max-w-2xl w-full">

      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
          Welcome Back
        </h1>

        <form onSubmit={handleLogin} className="space-y-6">
          {/* Email */}
          <div className="relative">
            <FiMail className="absolute left-3 top-3 text-gray-400 text-lg" />
            <input
              type="email"
              placeholder="Enter E-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="peer pl-10 h-12 w-full border-b-2 border-gray-300 text-gray-900 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Password */}
          <div className="relative">
            <FiLock
              onClick={() => setEyeclose((p) => !p)}
              className="absolute left-3 top-3 text-gray-400 text-lg cursor-pointer hover:text-cyan-600"
            />
            <input
              type={eyeOpen ? "text" : "password"}
              placeholder="Enter Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="peer pl-10 h-12 w-full border-b-2 border-gray-300 text-gray-900 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Button */}
          <button
            type="submit"
            className="w-full bg-gradient-to-r flex justify-center from-newPrimary to-blue-400 text-white font-semibold py-3 rounded-lg shadow-md hover:opacity-90 transition"
          >
            {loding ? <span className="animate-spin"><Loader size={18} /></span> : "Login"}
          </button>
        </form>

        {/* Signup link */}
        <p className="mt-6 text-center text-sm text-gray-500">
          Don't have an account?{" "}
          <Link
            to="/signup"
            className="text-cyan-600 font-medium hover:underline"
          >
            Create
          </Link>
        </p>
      </div>
    </div>
  </div>
</div>





  );
};

export default Login;
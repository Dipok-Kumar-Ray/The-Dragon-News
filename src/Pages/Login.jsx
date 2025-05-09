import React, { useContext, useState } from "react";
import { Link, useLoaderData, useLocation, useNavigate } from "react-router";
import { AuthContext } from "../provider/AuthProvider";

const Login = () => {
  const [error, setError] = useState('');
  const {signIn} = useContext(AuthContext);
  const location = useLocation()
  console.log(location);

  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    const form = e.target;
    const email = form.email.value;
    const password = form.password.value;
    console.log(email,password)
  
    signIn(email, password)
    .then(result =>{
      console.log(result.user);
      const user = result.user;
     console.log(user);
     navigate(`${location.state ? location.state : '/'}`);
    })

    .catch(error =>{
      console.log(error.message);
      const errorCode = error.message;
      // alert(errorMessage)
      setError(errorCode);
    })
  }
  return (
    <div>
      <div className="mx-auto card bg-base-100 w-full max-w-sm shrink-0 shadow-2xl">
        <h1 className="text-center font-semi-bold text-2xl py-4">
          Login your account
        </h1>

        <div className="card-body">
          <form onSubmit={handleLogin} className="fieldset">
            {/* email */}
            <label className="label">Email :</label>
            <input type="email" name="email" className="input" placeholder="Email" required />
            {/* password */}
            <label className="label">Password :</label>
            <input type="password" name="password" className="input" placeholder="Password" required />
            <div>
              <a className="link link-hover">Forgot password?</a>
            </div>
            {error && <p className="text-red-400 text-xs">{error}</p>}
            <button type="submit" className="btn btn-neutral mt-4">Login</button>
            <p className="font-semibold text-center mt-3">
              Don't have an Account?{" "}
              <Link className="text-blue-700 underline" to="/auth/register">
                {" "}
                Register
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;

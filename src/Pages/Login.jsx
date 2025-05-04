import React, { useContext } from "react";
import { Link } from "react-router";
import { AuthContext } from "../provider/AuthProvider";

const Login = () => {
  const {signIn} = useContext(AuthContext);

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
    })

    .catch(error =>{
      console.log(error.message);
      // const errorMessage = error.message;
      // alert(errorMessage)
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
            <input type="email" name="email" className="input" placeholder="Email" />
            {/* password */}
            <label className="label">Password :</label>
            <input type="password" name="password" className="input" placeholder="Password" />
            <div>
              <a className="link link-hover">Forgot password?</a>
            </div>
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

import React from "react";
import { Link } from "react-router";

const Login = () => {
  return (
    <div>
      <div className="mx-auto card bg-base-100 w-full max-w-sm shrink-0 shadow-2xl">
        <h1 className="text-center font-semi-bold text-2xl py-4">
          Login your account
        </h1>

        <div className="card-body">
          <fieldset className="fieldset">
            <label className="label">Email :</label>
            <input type="email" className="input" placeholder="Email" />
            <label className="label">Password :</label>
            <input type="password" className="input" placeholder="Password" />
            <div>
              <a className="link link-hover">Forgot password?</a>
            </div>
            <button className="btn btn-neutral mt-4">Login</button>
            <p className="font-semibold text-center mt-3">
              Don't have an Account?{" "}
              <Link className="text-blue-700 underline" to="/auth/register">
                {" "}
                Register
              </Link>
            </p>
          </fieldset>
        </div>
      </div>
    </div>
  );
};

export default Login;

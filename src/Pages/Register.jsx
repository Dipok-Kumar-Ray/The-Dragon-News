import React from 'react';

const Register = () => {
    return (
        <div>
             <div className="mx-auto card bg-base-100 w-full max-w-sm shrink-0 shadow-2xl">
        <h1 className="text-center font-semi-bold text-2xl py-4">
          Login your account
        </h1>

        <div className="card-body">
          <fieldset className="fieldset">
            {/* name */}
            <label className="label">Name :</label>
            <input type="text" className="input" placeholder="Enter your name" />
            {/* photo URL */}
            <label className="label">Photo URL :</label>
            <input type="email" className="input" placeholder="Photo URL" />
            {/* email */}
            <label className="label">Email :</label>
            <input type="email" className="input" placeholder="Enter your Email" />
            {/* password */}
            <label className="label">Password :</label>
            <input type="password" className="input" placeholder="Password" />
            <button className="btn btn-neutral mt-4">Register</button>
            <p className="font-semibold text-center mt-3">
              Allready have an Account?
              <Link className="text-blue-700 underline" to="/auth/login">
                Login
              </Link>
            </p>
          </fieldset>
        </div>
      </div>
        </div>
    );
};

export default Register;
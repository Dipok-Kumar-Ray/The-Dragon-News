import React from 'react';
import { Link } from 'react-router';

const Register = () => {
  const handleRegister = e =>{
    e.preventDefault();
    const form = e.target;
    const name = form.name.value;
    const email = form.email.value;
    const password = form.password.value;
    const photo = form.photo.value;
    console.log(name, email, password, photo);
  }
    return (
        <div>
             <div className="mx-auto card bg-base-100 w-full max-w-sm shrink-0 shadow-2xl">
        <h1 className="text-center font-semi-bold text-2xl py-4">
          Login your account
        </h1>

        <div className="card-body">
          <form onSubmit={handleRegister} className="fieldset">
            {/* name */}
            <label className="label">Name :</label>
            <input type="text" name='name' className="input" placeholder="Enter your name" />
            {/* photo URL */}
            <label className="label">Photo URL :</label>
            <input type="email"  name='photo' className="input" placeholder="Photo URL" />
            {/* email */}
            <label className="label">Email :</label>
            <input type="email" name='email' className="input" placeholder="Enter your Email" />
            {/* password */}
            <label className="label">Password :</label>
            <input type="password" name='password' className="input" placeholder="Password" />
            <button type='submit' className="btn btn-neutral mt-4">Register</button>
            <p className="font-semibold text-center mt-3">
              Allready have an Account?
              <Link className="text-blue-700 underline" to="/auth/login">
                Login
              </Link>
            </p>
          </form>
        </div>
      </div>
        </div>
    );
};

export default Register;
import React, { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import { setUser } from "../../redux/auth/actions";
import api from "../../services/api";
import { ENVIRONMENT } from "../../config";

const Signin = () => {
  const [values, setValues] = useState(
    ENVIRONMENT === "development"
      ? { email: "admin@email.com", password: "admin" }
      : { email: "", password: "" }
  );
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();
  const user = useSelector((state) => state.Auth.user);

  const location = useLocation();
  const redirectUrl = new URLSearchParams(location.search).get("redirectUrl");

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setLoading(true);
      const res = await api.post(`/user/signin`, values);
      setLoading(false);
      if (res.token) api.setToken(res.token);
      if (res.user) dispatch(setUser(res.user));
    } catch (e) {
      setLoading(false);
      console.log("e", e);
    }
  };

  if (user && !user.blocked) return <Navigate to={redirectUrl || "/"} />;

  return (
    <form
      onSubmit={handleSubmit}
      className="m-5 mx-auto mt-10 w-full md:w-1/2 p-14 rounded-md bg-white font-myfont"
    >
      <h1 className="text-4xl font-bold text-blue-600 mb-4 font-[Helvetica] text-center">
        Log in
      </h1>

      <div className="my-4" />
      <div>
        <div className="mb-6">
          <div className="flex flex-col-reverse">
            <input
              placeholder="E-mail"
              className="peer bg-transparent outline-0 block w-full p-2.5 rounded-sm border border-gray-300 text-gray-800 leading-tight focus:outline-none focus:border-primary focus:border"
              name="email"
              type="email"
              id="email"
              value={values.email}
              onChange={(e) => setValues({ ...values, email: e.target.value })}
            />
            <label className="peer-focus:text-primary" htmlFor="email">
              E-mail
            </label>
          </div>
        </div>
        <div className="mb-6">
          <div className="flex flex-col-reverse">
            <input
              placeholder="Mot de passe"
              className="peer bg-transparent outline-0 block w-full p-2.5 rounded-sm border border-gray-300 text-gray-800 leading-tight focus:outline-none focus:border-primary focus:border "
              name="password"
              type="password"
              id="password"
              value={values.password}
              onChange={(e) =>
                setValues({ ...values, password: e.target.value })
              }
            />
            <label className="peer-focus:text-primary" htmlFor="password">
              Mot de passe
            </label>
          </div>
        </div>
        <button
          disabled={loading || !values.email || !values.password}
          className="w-full p-3 rounded-md hover:bg-blue-600 bg-blue-500 text-white font-bold"
          type="submit"
        >
          Login
        </button>
        <hr className="my-5" />
        <div className="flex justify-center">
          {/* <div className="mr-6">
                        <div className="text-center text-sm text-gray-600">
                            Vous n'avez pas de compte ?
                        </div>
                        <div className="text-center">
                            <Link className="text-primary hover:underline" to={`/auth/signup?redirectUrl=${redirectUrl || "/dice"}`}>
                                Créer un compte
                            </Link>
                        </div>
                    </div> */}
        </div>
      </div>
    </form>
  );
};

export default Signin;

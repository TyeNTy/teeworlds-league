import React, { useState } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import api from "../../services/api";
import { setUser } from "../../redux/auth/actions";

const Signup = () => {
    const [values, setValues] = useState({
        userName: "",
        email: "",
        password: "",
        confirmPassword: "",
    });
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const location = useLocation();
    const redirectUrl = new URLSearchParams(location.search).get("redirectUrl");

    const user = useSelector((state) => state.Auth.user);
    const dispatch = useDispatch();

    const submit = async () => {
        try {
            setLoading(true);
            let res = await api.post(`/user/signup`, values);
            setLoading(false);
            if (res.ok) {
                res = await api.post(`/user/signin`, { email: values.email, password: values.password });

                if (res.token) api.setToken(res.token);
                if (res.user) dispatch(setUser(res.user));

                navigate(redirectUrl || "/auth/signin");
            }
        } catch (e) {
            setLoading(false);
            console.log("e", e);
        }
    };

    if (user) return <Navigate to={redirectUrl || "/dice"} />;

    return (
        <div className="m-5 mx-auto mt-10 w-full md:w-1/2 p-14 rounded-md bg-white font-myfont">
            <h1 className="text-4xl font-bold text-blue-600 mb-4 font-[Helvetica] text-center">
                Créer un compte
            </h1>

            <div>
                <div className="flex gap-4 mb-6">
                    <div className="flex flex-1 flex-col-reverse">
                        <input
                            placeholder="Nom d'utilisateur"
                            className="peer bg-transparent outline-0 block w-full p-2.5 rounded-sm border border-gray-300 text-gray-800 leading-tight focus:outline-none focus:border-primary focus:border "
                            name="userName"
                            type="text"
                            id="userName"
                            value={values.userName}
                            onChange={(e) =>
                                setValues({ ...values, userName: e.target.value })
                            }
                        />
                        <label className="peer-focus:text-primary" htmlFor="lastName">
                            Nom d'utilisateur
                        </label>
                    </div>
                </div>
                <div className="mb-6">
                    <div className="flex flex-col-reverse">
                        <input
                            placeholder="E-mail"
                            className="peer bg-transparent outline-0 block w-full p-2.5 rounded-sm border border-gray-300 text-gray-800 leading-tight focus:outline-none focus:border-primary focus:border "
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
                <div className="mb-6">
                    <div className="flex flex-col-reverse">
                        <input
                            placeholder="Confirmer le mot de passe"
                            className="peer bg-transparent outline-0 block w-full p-2.5 rounded-sm border border-gray-300 text-gray-800 leading-tight focus:outline-none focus:border-primary focus:border "
                            name="confirmPassword"
                            type="password"
                            id="confirmPassword"
                            value={values.confirmPassword}
                            onChange={(e) =>
                                setValues({ ...values, confirmPassword: e.target.value })
                            }
                        />
                        <label className="peer-focus:text-primary" htmlFor="confirmPassword">
                            Confirmer le mot de passe
                        </label>
                    </div>
                </div>
                <button
                    disabled={loading || !values.email || !values.password || values.password !== values.confirmPassword}
                    className="disabled:cursor-not-allowed disabled:opacity-40 bg-primary outline-0 block w-full p-2.5 rounded-sm leading-tight hover:bg-primary-400"
                    onClick={submit}
                >
                    Rejoindre le Pascal
                </button>
                <hr className="my-5" />
                <div className="flex justify-center">
                    <div className="mr-6">
                        <div className="text-center text-sm text-gray-600">
                            Vous avez déjà un compte ?
                        </div>
                        <div className="text-center">
                            <Link className="text-primary hover:underline" to={`/auth/signin?redirectUrl=${redirectUrl || "/dice"}`}>
                                Se connecter
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Signup;
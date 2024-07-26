import React from "react";
import { Route, Routes } from "react-router-dom";

import Signin from "./signin";
import Signup from "./signup";

const Auth = () => {
    return (
        <Routes>
            <Route path="/signin" element={<Signin />} />
        </Routes>
    );
};

export default Auth;
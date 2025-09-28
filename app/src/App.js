import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  BrowserRouter,
  Routes,
  Outlet,
  Route,
  redirect,
  Navigate,
} from "react-router-dom";
import { setUser } from "./redux/auth/actions";

import api from "./services/api";
import Footer from "./components/Footer";
import Loader from "./components/Loader";
import Auth from "./scenes/auth";
import TopBarLeague from "./components/TopBarLeague";
import Ranked from "./scenes/ranked";
import League from "./scenes/league";

const ProtectedLayout = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);

  // const user = useSelector((state) => state.Auth.user);

  async function fetchData() {
    try {
      const res = await api.get("/user/signin_token");
      if (!res.ok || !res.user) {
        setLoading(false);
        dispatch(setUser(null));
        return;
      }
      if (res.token) api.setToken(res.token);
      dispatch(setUser(res.user));
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    document.title = "gCTF League";

    fetchData();
  }, []);

  // if (!user) return <Navigate to="/auth/signin" />;
  if (loading) return <Loader />;

  return (
    <div className="flex min-h-screen w-screen flex-col bg-gray-50">
      <div className="flex flex-1">
        <div className="flex min-h-screen w-full flex-col">
          <TopBarLeague />
          <div className="flex-1">
            <Outlet />
          </div>
          <Footer />
        </div>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<ProtectedLayout />}>
          <Route path="/ranked/*" element={<Ranked />} />
          <Route path="/league/*" element={<League />} />
          <Route path="/*" element={<Ranked />} />
        </Route>

        <Route path="/auth/*" element={<Auth />} />
        <Route path="/*" index element={<Auth />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;

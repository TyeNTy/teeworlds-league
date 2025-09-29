import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import {
  BrowserRouter,
  Routes,
  Outlet,
  Route,
  Navigate,
} from "react-router-dom";
import { setUser } from "./redux/auth/actions";

import api from "./services/api";
import Loader from "./components/Loader";
import Auth from "./scenes/auth";
import Ranked from "./scenes/ranked";
import League from "./scenes/league";

const ProtectedLayout = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);

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

  if (loading) return <Loader />;

  return (
    <div className="flex min-h-screen w-screen flex-col bg-gray-50">
      <Outlet />
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
          <Route path="/" element={<Navigate to="/ranked" replace />} />
        </Route>

        <Route path="/auth/*" element={<Auth />} />
        <Route path="/*" index element={<Auth />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;

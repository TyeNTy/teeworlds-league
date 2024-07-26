import "isomorphic-fetch";

import { API_URL } from "../config";
import { toast } from "react-hot-toast";

class api {
  constructor() {
    this.token = "";
  }

  getToken() {
    return this.token;
  }

  setToken(token) {
    this.token = token;
  }

  async toastWrapper(fetchFunction) {
    const res = await fetchFunction();

    const response = await res.json();
    response.status = res.status;

    if (response.displayMessage ?? true) {
      if (!response.ok)
        toast.error(response.message || "Woops!... Something went wrong ):");
      else if (response.message) {
        toast.success(response.message);
      }
    }
    return response;
  }

  get(path, params = null) {
    let url = `${API_URL}${path}`;
    if (params) url += `?${new URLSearchParams(params)}`;
    return new Promise(async (resolve, reject) => {
      try {
        const response = await this.toastWrapper(() =>
          fetch(url, {
            mode: "cors",
            method: "GET",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
              Authorization: `JWT ${this.token}`,
            },
          })
        );

        resolve(response);
      } catch (e) {
        reject(e);
      }
    });
  }

  put(path, body) {
    return new Promise(async (resolve, reject) => {
      try {
        const response = await this.toastWrapper(() =>
          fetch(`${API_URL}${path}`, {
            mode: "cors",
            method: "PUT",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
              Authorization: `JWT ${this.token}`,
            },
            body: typeof body === "string" ? body : JSON.stringify(body),
          })
        );

        resolve(response);
      } catch (e) {
        reject(e);
      }
    });
  }

  putFormData(path, formData) {
    return new Promise(async (resolve, reject) => {
      try {
        const response = await this.toastWrapper(() =>
          fetch(`${API_URL}${path}`, {
            mode: "cors",
            method: "PUT",
            credentials: "include",
            headers: { Authorization: `JWT ${this.token}` },
            body: formData,
          })
        );

        resolve(response);
      } catch (e) {
        reject(e);
      }
    });
  }

  postFormData(path, formData) {
    return new Promise(async (resolve, reject) => {
      try {
        const response = await fetch(`${API_URL}${path}`, {
          mode: "cors",
          credentials: "include",
          method: "POST",
          headers: { Authorization: `JWT ${this.token}` },
          body: formData,
        });
        const res = await response.json();
        resolve(res);
      } catch (e) {
        console.log("e", e);
        reject(e);
      }
    });
  }

  remove(path, params = null) {
    let url = `${API_URL}${path}`;
    if (params) url += `?${new URLSearchParams(params)}`;
    return new Promise(async (resolve, reject) => {
      try {
        const response = await this.toastWrapper(() =>
          fetch(url, {
            mode: "cors",
            credentials: "include",
            method: "DELETE",
            headers: {
              Authorization: `JWT ${this.token}`,
            },
          })
        );

        resolve(response);
      } catch (e) {
        reject(e);
      }
    });
  }

  post(path, body) {
    return new Promise(async (resolve, reject) => {
      try {
        const response = await this.toastWrapper(() =>
          fetch(`${API_URL}${path}`, {
            mode: "cors",
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
              Authorization: `JWT ${this.token}`,
            },
            body: typeof body === "string" ? body : JSON.stringify(body),
          })
        );

        resolve(response);
      } catch (e) {
        reject(e);
      }
    });
  }

  download(path, body) {
    return new Promise(async (resolve, reject) => {
      try {
        const response = await this.toastWrapper(() =>
          fetch(`${API_URL}${path}`, {
            mode: "cors",
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
              Authorization: `JWT ${this.token}`,
            },
            body: typeof body === "string" ? body : JSON.stringify(body),
          })
        );

        if (response.status !== 200) {
          return reject(response);
        }
        resolve(response);
      } catch (e) {
        reject(e);
      }
    });
  }
}

const API = new api();
export default API;

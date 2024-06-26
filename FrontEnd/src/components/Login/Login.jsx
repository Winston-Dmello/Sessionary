import React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../Layout/Layout";
import Layout from "../../Layout/Layout";
import "./Login.css";
import { Link } from "react-router-dom";
import Alert from "../../Layout/Alert";
import { BASE_URL } from "../../Api";

function Login() {
  localStorage.clear();
  const navigate = useNavigate();
  const [alert, setAlert] = useState("");
  async function submitForm(event) {
    event.preventDefault(); //stops default behaviour
    let formData = new FormData(document.getElementById("myForm"));
    let details = JSON.stringify(Object.fromEntries(formData));

    try {
      const response = await fetch(`${BASE_URL}Login/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: details,
      });

      if (response.status == 200) {
        const data = await response.json();
        let UserID = data.UserID;
        let Username = data.Username;
        let authorizationHeader = response.headers.get("Authorization");

        localStorage.setItem("UserID", UserID);
        localStorage.setItem("Username", Username);
        localStorage.setItem("token", authorizationHeader);
        navigate("/message");
        setAlert("Login Successful! Redirect user to a different page");
      } else if (response.status == 400) {
        setAlert("User Doesn't Exist!");
      } else if (response.status == 401) {
        setAlert("Password doesn't match!");
      } else {
        setAlert("Submission failed. Try again.");
        console.error("Form submission failed");
      }
    } catch (error) {
      console.error("An error occurred during form submission", error);
    }
  }
  function handleClose() {
    setAlert("");
  }

  return (
    <Layout
      navChildren={
        <ul className="ulist">
          <li className="listItem">
            <button
              className="route-btn"
              onClick={() => {
                navigate("/");
              }}
            >
              Home
            </button>
          </li>
          <li className="listItem">
            <button className="route-btn" onClick={() => navigate("/signup")}>
              Signup
            </button>
          </li>
        </ul>
      }
      mainContentChildren={
        <>
          <div className="login-content">
            <div className="login-form">
              <h1 className="login-txt">Login</h1>
              <form id="myForm" onSubmit={() => submitForm(event)}>
                <div>
                  <label className="label-txt" htmlFor="username">
                    Username:{" "}
                  </label>
                  <input
                    className="user-details"
                    id="username"
                    type="text"
                    name="username"
                    autoComplete="username"
                    required
                  ></input>
                </div>
                <br />

                <div>
                  <label className="label-txt" htmlFor="password">
                    Password:{" "}
                  </label>
                  <input
                    id="password"
                    className="user-details"
                    type="password"
                    name="password"
                    autoComplete="current-password"
                    required
                  ></input>
                </div>
                <br />

                <div>
                  <button className="btn" type="submit">
                    Submit
                  </button>
                </div>
              </form>
            </div>
          </div>
          {alert && <Alert details={alert} onHandleClose={handleClose} />}
        </>
      }
    />
  );
}

export default Login;

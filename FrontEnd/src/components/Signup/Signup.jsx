import React from "react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import "../../styles/Signup.css";
import "../Login/Login.css";
import Layout from "../../Layout/Layout";
import { Link } from "react-router-dom";
import Alert from "../../Layout/Alert";

function Signup() {
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [alert, setAlert] = useState("");

  async function submitForm(event) {
    event.preventDefault(); //stops default behaviour
    let formData = new FormData(document.getElementById("myForm"));
    let details = JSON.stringify(Object.fromEntries(formData));
    console.log(details);

    try {
      const response = await fetch("http://localhost:8000/register_user/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: details,
      });

      if (response.status == 200) {
        navigate("/login");
      } else if (response.status == 409) {
        setAlert("Username Taken. Try a different username!");
      } else {
        setAlert("Submission failed. Try again.");
      }
    } catch (error) {
      setAlert("An error occurred during form submission!");
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
            <Link to="/">Home</Link>
          </li>
          <li className="listItem">
            <Link to="/login">Login</Link>
          </li>
        </ul>
      }
      mainContentChildren={
        <>
          <div className="login-content">
            <div className="login-form">
              <h1 style={{ color: "#123ea2", marginBottom: "1.5vh" }}>
                Sign up!
              </h1>
              <form id="myForm" onSubmit={() => submitForm(event)}>
                <div>
                  <label htmlFor="username">Username: </label>
                  <input
                    type="text"
                    name="username"
                    autoComplete="username"
                    className="user-details"
                    required
                  ></input>
                </div>
                <br />
                <div>
                  <label htmlFor="password">Password: </label>
                  <input
                    type="password"
                    name="password"
                    className="user-details"
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

export default Signup;

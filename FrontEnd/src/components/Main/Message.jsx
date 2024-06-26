import React, { useState, useEffect } from "react";
import axios from "axios";
import Invite from "./components/Invite";
import "../../styles/Message.css";
import Requests from "./components/requests";
import Sessions from "./components/sessions";
import Sessionary_Messages from "./components/Sessionary_Messages";
import { useNavigate } from "react-router-dom";
import "./styles/sessions.css";
import Layout from "../../Layout/Layout";
import Alert from "../../Layout/Alert";
import profile from "./components/Session_Images/Profile.png";
import { BASE_URL, web_socket_url } from "../../Api";

const WebSocketExample = () => {
  const navigate = useNavigate();
  if (localStorage.getItem("UserID") === null) {
    navigate("/");
  }
  useEffect(() => {
    localStorage.removeItem("SessionID");
  }, []);
  const [websocket, setWebsocket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [messages, setMessages] = useState([]);
  const [alert, setAlert] = useState("");
  const jtoken = localStorage.getItem("token");
  const UserId = localStorage.getItem("UserID");
  const Username = localStorage.getItem("Username");
  useEffect(() => {
    try {
      const [, token] = jtoken.split("Bearer ");

      axios
        .get(`${BASE_URL}Load_Details/${UserId}?token=${token}`)
        .then((response) => {
          setLoading(false);
          const session_data = response.data.Sessions;
          setSessions(session_data);
        })
        .catch((error) => {
          console.error("GET request failed:", error);
        });
      const socket = new WebSocket(
        `${web_socket_url}connection/${UserId}?token=${token}`
      );
      socket.onopen = () => {
        console.log("WebSocket connection opened");
      };
      socket.onmessage = (event) => {
        let data = JSON.parse(event.data);

        if (data["type"] == "Error") {
          setAlert(data["Details"]);
        } else if (data["type"] == "pending requests") {
          setRequests(data["Username"]);
        } else if (data["type"] == "Session") {
          const prevlist = sessions;
          setSessions((prevlist) => [data["Session"], ...prevlist]);
        } else if (data["type"] == "load messages") {
          setMessages(data["Messages"]);
        } else if (data["type"] == "message") {
          let SessionID = localStorage.getItem("SessionID");
          if (data["SessionID"] == SessionID) {
            const prevmessages = messages;
            setMessages((prevmessages) => prevmessages.concat(data["Message"]));
          } else {
            setSessions((prevList) =>
              prevList.map((session) =>
                session.SessionID === data["SessionID"]
                  ? { ...session, Color: "True" }
                  : session
              )
            );
          }
        }
      };

      socket.onclose = () => {
        setAlert("Server Connection Lost, Try Refreshing");
      };
      socket.onerror = (event) => {
        setAlert("Web Socket Error!");
      };
      setWebsocket(socket);
    } catch (err) {
      setAlert("Internal Server Error! Code 500");
    }
  }, []);

  function handleClose() {
    setAlert("");
  }
  // Empty dependency array ensures the effect runs only once on mount
  const update_sessions = (Value) => {
    const updatedList = [...sessions];
    const indexToRemove = updatedList.findIndex(
      (sesh) => sesh.SessionID === Value
    );

    if (indexToRemove !== -1) {
      const removedSesh = updatedList.splice(indexToRemove, 1)[0];
      updatedList.unshift(removedSesh);
      setSessions(updatedList);
    }
  };

  const update_notif = () => {
    setSessions((prevList) =>
      prevList.map((session) =>
        session.SessionID === localStorage.getItem("SessionID")
          ? { ...session, Color: "None" }
          : session
      )
    );
  };
  if (loading) return <p>Loading...</p>;

  const Logout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <Layout
      navChildren={
        <div className="message-nav-bar">
          <div className="username-logout">
            <div className="profile-pics">
              <img className="profiles" src={profile} alt="Profile" />
            </div>
            {Username}
          </div>
          <div className="invite-friend">
            <Invite websocket={websocket} />
          </div>
          <div className="request-logout-btn">
            <div className="requests-btn">
              {requests && <Requests Data={[requests, websocket]} />}
            </div>
            <button className="logout-btn" onClick={() => Logout()}>
              Logout
            </button>
          </div>
        </div>
      }
      mainContentChildren={
        <div className="Main">
          {sessions && <Sessions Data={[sessions, websocket, update_notif]} />}
          {messages && (
            <Sessionary_Messages
              Data={[messages, websocket, update_sessions]}
            />
          )}
          {alert && <Alert details={alert} onHandleClose={handleClose} />}
        </div>
      }
    />
  );
};

export default WebSocketExample;

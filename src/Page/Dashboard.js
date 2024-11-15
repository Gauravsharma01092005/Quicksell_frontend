import React, { useEffect, useState } from "react";
import Card from "../Components/Card";
import Navbar from "../Components/Navbar";
import CustomSpinner from "../Components/CustomSpinner";

// Import Images

import profile from "../Assets/profile.png";
import profile1 from "../Assets/profile1.png";
import profile4 from "../Assets/profile4.jpeg";
import profile5 from "../Assets/profile5.jpeg";
import profile6 from "../Assets/profile6.png";
import profile7 from "../Assets/profile7.png";

import dotMenu from "../Assets/icons/3 dot menu.svg";
import add from "../Assets/icons/add.svg";
import backlog from "../Assets/icons/Backlog.svg";
import cancelled from "../Assets/icons/Cancelled.svg";
import done from "../Assets/icons/Done.svg";
import highPriority from "../Assets/icons/Img - High Priority.svg";
import lowPriority from "../Assets/icons/Img - Low Priority.svg";
import mediumPriority from "../Assets/icons/Img - Medium Priority.svg";
import inProgress from "../Assets/icons/in-progress.svg";
import noPriority from "../Assets/icons/No-priority.svg";
import urgentPriorityColor from "../Assets/icons/SVG - Urgent Priority colour.svg";
import toDo from "../Assets/icons/To-do.svg";





const Dashboard = () => {
  // State Variables
  const [userData, setUserData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [status, setStatus] = useState({});
  const [user, setUser] = useState({});
  const [priority, setPriority] = useState({});
  const [grouping, setGrouping] = useState('status');
  const [ordering, setOrdering] = useState('priority');
  const [availableUser, setAvailableUser] = useState({});
  const [statusMapping, setStatusMapping] = useState({});
  const statusKeys = ["Backlog", "Todo", "In progress", "Done", "Canceled"];
  

  useEffect(() => {
    getData();
  }, [grouping, ordering]);

  const sortByTitle = (tickets) => {
    return tickets.sort((a, b) => a.title.localeCompare(b.title));
  };

  const groupByStatus = (tickets) => {
    let sortedTickets = tickets;

    if (ordering === "title") {
      sortedTickets = sortByTitle(tickets);
    }

    const grouped = sortedTickets.reduce((acc, ticket) => {
      if (!acc[ticket.status]) {
        acc[ticket.status] = [];
      }
      acc[ticket.status].push(ticket);
      return acc;
    }, {});

    statusKeys.forEach((key) => {
      if (!grouped[key]) {
        grouped[key] = [];
      }
    });

    if (ordering === "priority") {
      for (let key in grouped) {
        grouped[key].sort((a, b) => b.priority - a.priority);
      }
    }

    return {
      Keys: statusKeys,
      ...grouped,
    };
  };

  const groupByPriority = (tickets) => {
    let sortedTickets = tickets;

    if (ordering === "title") {
      sortedTickets = sortByTitle(tickets);
    }

    const priorityObject = sortedTickets.reduce((acc, ticket) => {
      if (!acc[ticket.priority]) {
        acc[ticket.priority] = [];
      }
      acc[ticket.priority].push(ticket);
      return acc;
    }, {});

    return {
      Keys: Object.keys(priorityObject),
      ...priorityObject,
    };
  };

  const groupByUser = (tickets) => {
    let sortedTickets = tickets;

    if (ordering === "title") {
      sortedTickets = sortByTitle(tickets);
    }

    const grouped = sortedTickets.reduce((acc, ticket) => {
      if (!acc[ticket.userId]) {
        acc[ticket.userId] = [];
      }
      acc[ticket.userId].push(ticket);
      return acc;
    }, {});

    if (ordering === "priority") {
      for (let key in grouped) {
        grouped[key].sort((a, b) => b.priority - a.priority);
      }
    }

    return {
      Keys: userData.map((user) => user.id.toString()),
      ...grouped,
    };
  };

  const availabilityMap = (users) => {
    return users.reduce((acc, user) => {
      acc[user.id] = user.available;
      return acc;
    }, {});
  };

  const extractStatusMapping = (data) => {
    const statusMapping = {};

    data.tickets.forEach((ticket) => {
      statusMapping[ticket.id] = ticket.status;
    });

    return statusMapping;
  };

  const getData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("https://api.quicksell.co/v1/internal/frontend-assignment");
      const data = await response.json();
      setIsLoading(false);
      setUserData(data.users);
      setUser(groupByUser(data.tickets));
      setStatus(groupByStatus(data.tickets));
      setPriority(groupByPriority(data.tickets));
      setAvailableUser(availabilityMap(data.users));
      setStatusMapping(extractStatusMapping(data));
    } catch (e) {
      console.log(e);
      setIsLoading(false);
    }
  };

  if (grouping === "status") {
    return (
      <>
        <div>
          <Navbar
            grouping={grouping}
            setGrouping={setGrouping}
            ordering={ordering}
            setOrdering={setOrdering}
            call={getData}
          />
          <div className="Dashboard-Container">
            {isLoading ? (
              <CustomSpinner />
            ) : (
              <>
                {status.Keys.map((item, index) => (
                  <div className="column" key={index}>
                    <div className="Header">
                      <div className="icon-text">
                        {item === "Todo" ? (
                          <img src={toDo} alt="To Do" id="todo" className="icon" />
                        ) : item === "In progress" ? (
                          <img src={inProgress} alt="progress" id="progress" className="icon" />
                        ) : item === "Backlog" ? (
                          <img src={backlog} alt="backlog" id="backlog" className="icon" />
                        ) : item === "Done" ? (
                          <img src={done} alt="done" id="done" className="icon" />
                        ) : (
                          <img src={cancelled} alt="cancel" id="cancel" className="icon" />
                        )}
                        <span className="text">
                          {item === "In progress" ? "In Progress" : item}
                        </span>
                        <span>{status[item]?.length}</span>
                      </div>
                      <div className="actions">
                        <img src={add} alt="add" id="add" className="icon" />
                        <img src={dotMenu} alt="dots" id="dots" className="icon" />
                      </div>
                    </div>
                    {status[item] &&
                      status[item].map((value) => {
                        return (
                          <Card
                            id={value.id}
                            title={value.title}
                            tag={value.tag}
                            userId={value.userId}
                            status={status}
                            userData={userData}
                            priority={value.priority}
                            key={value.id}
                            grouping={grouping}
                            ordering={ordering}
                            statusMapping={statusMapping}
                          />
                        );
                      })}
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </>
    );
  } else if (grouping === "users") {
    return (
      <>
        <div>
          <Navbar
            grouping={grouping}
            setGrouping={setGrouping}
            ordering={ordering}
            setOrdering={setOrdering}
            call={getData}
          />
          <div className="Dashboard-Container">
            {isLoading ? (
              <CustomSpinner />
            ) : (
              <>
                {availableUser &&
                  user.Keys.map((userId, index) => {
                    const currentUserName =
                      userData.find((u) => u.id.toString() === userId)?.name ||
                      "Unknown";
                    return (
                      <div className="column" key={index}>
                        <div className="Header">
                          <div className="icon-text">
                            <div
                              className={
                                String(availableUser[userId]) === "false"
                                  ? "user-avatar-unavailable"
                                  : "user-avatar"
                              }
                            >
                              <img
                                src={
                                  userId === "usr-1"
                                    ? profile1
                                    : userId === "usr-2"
                                    ? profile6
                                    : userId === "usr-3"
                                    ? profile7
                                    : userId === "usr-4"
                                    ? profile5
                                    : userId === "usr-5"
                                    ? profile4
                                    : profile
                                }
                                className={
                                  String(availableUser[userId]) === "false"
                                    ? "user-avatar-unavailable"
                                    : "user-avatar"
                                }
                                alt="user"
                              ></img>
                            </div>
                            <span className="text">{currentUserName}</span>
                            <span>{user[userId]?.length}</span>
                          </div>
                          <div className="actions">
                          <img src={add} alt="add" id="add" className="icon" />
                          <img src={dotMenu} alt="dots" id="dots" className="icon" />
                          </div>
                        </div>
                        {user[userId] &&
                          user[userId].map((ticket) => {
                            return (
                              <Card
                                id={ticket.id}
                                title={ticket.title}
                                tag={ticket.tag}
                                userId={ticket.userId}
                                userData={userData}
                                priority={ticket.priority}
                                key={ticket.id}
                                grouping={grouping}
                                ordering={ordering}
                                status={status}
                                statusMapping={statusMapping}
                              />
                            );
                          })}
                      </div>
                    );
                  })}
              </>
            )}
          </div>
        </div>
      </>
    );
  } else {
    return (
      <>
        <div>
          <Navbar
            grouping={grouping}
            setGrouping={setGrouping}
            ordering={ordering}
            setOrdering={setOrdering}
            call={getData}
          />
          <div className="Dashboard-Container">
            {isLoading ? (
              <CustomSpinner />
            ) : (
              <>
                {priority.Keys
                  .sort((a, b) => {
                    const orderMap = {
                      "0": 0,  // No Priority
                      "1": 4,  // Urgent
                      "2": 3,  // High
                      "3": 2,  // Medium
                      "4": 1   // Low
                    };
                    return orderMap[a] - orderMap[b];
                  })
                  .map((item, index) => (
                    <div className="column" key={index}>
                      <div className="Header">
                        <div className="icon-text-priority">
                          {item === "0" ? (
                            <img src={noPriority} alt="noPriority" id="noPriority" className="icon" />
                          ) : item === "1" ? (
                            <img src={lowPriority} alt="low" id="low" className="icon" />
                          ) : item === "2" ? (
                            <img src={mediumPriority} alt="medium" id="medium" className="icon" />
                          ) : item === "3" ? (
                            <img src={highPriority} alt="high" id="high" className="icon" />
                          ) : (
                            <img src={urgentPriorityColor} alt="urgent" id="urgent" className="icon" />
                          )}
                          <span className="text">
                            {`Priority ${item}` === "Priority 4"
                              ? "Urgent"
                              : `Priority ${item}` === "Priority 3"
                              ? "High"
                              : `Priority ${item}` === "Priority 2"
                              ? "Medium"
                              : `Priority ${item}` === "Priority 1"
                              ? "Low"
                              : "No Priority"}
                          </span>
                          <span className="count">{priority[item]?.length}</span>
                        </div>
                        <div className="actions">
                        <img src={add} alt="add" id="add" className="icon" />
                        <img src={dotMenu} alt="dots" id="dots" className="icon" />
                        </div>
                      </div>
                      {priority[item] &&
                        priority[item].map((value) => {
                          return (
                            <Card
                              id={value.id}
                              title={value.title}
                              tag={value.tag}
                              userId={value.userId}
                              status={status}
                              userData={userData}
                              priority={value.priority}
                              key={value.id}
                              grouping={grouping}
                              ordering={ordering}
                              statusMapping={statusMapping}
                            />
                          );
                        })}
                    </div>
                  ))}
              </>
            )}
          </div>
        </div>
      </>
    );
    
  }
};

export default Dashboard;

import React, { createContext, useState } from "react";
import { createStackNavigator } from "@react-navigation/stack";
export const Stack = createStackNavigator();
export const MainContext = createContext();

export const MainProvider = ({ children }) => {
  const [theme, setTheme] = useState("light");
  const [gradient, setGradient] = useState(["#f62e4a", "#ff8d4f"]);
  const fetchPath = "http://10.0.2.2:5000/";

  return (
    <MainContext.Provider
      value={{
        theme,
        setTheme,
        gradient,
        fetchPath,
      }}
    >
      {children}
    </MainContext.Provider>
  );
};

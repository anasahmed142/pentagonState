import React from "react";
import "../styles/globals.css";
import { Provider } from "react-redux";
import store from "../store/store";
import ThemeContext from "../context/ThemeContext";

function MyApp({ Component, pageProps }) {
  return (
    <React.StrictMode>
      <Provider store={store}>
        <ThemeContext>
          <Component {...pageProps} />
        </ThemeContext>
      </Provider>
    </React.StrictMode>
  );
}

export default MyApp;

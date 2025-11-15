import { Typography } from "@mui/material";
import Signup from "./Signup/SignUp";
import {ThemeProvider} from "@mui/material/styles";
import Theme from './Signup/Theme';
import "./App.css";

function App () {
    return (
      <div>
        <ThemeProvider theme={Theme}>
        <Signup/>
        </ThemeProvider>
      </div>
    )
}

export default App;

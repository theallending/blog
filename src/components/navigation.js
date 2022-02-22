import React from "react"
import {Link} from "gatsby"
import ThemeChanger from "../components/themeChanger"

export default (props) => (
  <nav className="navigation"> 
    <Link to="/about">About Me</Link>
    <Link to="/resume">Resume</Link>
    <Link to="/photography">Photography</Link>
    <ThemeChanger/>
  </nav>
  
)
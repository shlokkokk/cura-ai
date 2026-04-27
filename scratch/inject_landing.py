
import re

with open("scratch/cura.jsx", "r", encoding="utf-8") as f:
    jsx = f.read()

# Hook up Start Practicing button
jsx = jsx.replace("<button className=\"button11\">", "<button className=\"button11\" onClick={handleStartPracticing}>")
jsx = jsx.replace("<button className=\"button12\">", "<button className=\"button12\" onClick={handleStartPracticing}>")
jsx = jsx.replace("<button className=\"button13\">", "<button className=\"button13\" onClick={handleStartPracticing}>")

# Fix self closing tags like input
jsx = re.sub(r"(<input[^>]*?[^/])>", r"\1 />", jsx)

# Remove the empty app4 section if it exists (it seems to be a duplicate or mobile view?)
# Wait, looking at the HTML, <section className="app4"> is at the bottom, it might be the mobile view.

landing_code = f"""import React from "react";
import {{ useNavigate, Link }} from "react-router-dom";
import {{ useAuth }} from "../context/AuthContext";
import "../cura-global.css";
import "../cura.css";

export default function Landing() {{
  const {{ user }} = useAuth();
  const navigate = useNavigate();

  const handleStartPracticing = () => {{
    if (user) navigate("/simulator");
    else navigate("/login");
  }};

  return (
    <>
{jsx}
    </>
  );
}}
"""

with open("frontend/src/pages/Landing.jsx", "w", encoding="utf-8") as f:
    f.write(landing_code)



import re

with open("frontend/src/pages/Simulator.jsx", "r", encoding="utf-8") as f:
    sim_jsx = f.read()

# Make sure the imports include chat.css
if "chat.css" not in sim_jsx:
    sim_jsx = sim_jsx.replace("import Logo from '../components/Logo';", "import Logo from '../components/Logo';\nimport '../chat-global.css';\nimport '../chat.css';")

# We will just write a new file SimulatorNew.jsx that replaces the return statement of Simulator.jsx
# It is easier to use the existing logic and map it into the new HTML.

new_return = """
  return (
    <div className="chat-bot">
      {generatingAI && (
        <div className="ai-loading-overlay" style={{ position: "fixed", inset: 0, background: "rgba(255,255,255,0.85)", backdropFilter: "blur(4px)", zIndex: 9999, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <div className="typing-dots" style={{ marginBottom: "16px", transform: "scale(1.5)" }}><span></span><span></span><span></span></div>
          <h2 style={{ margin: 0, color: "var(--primary)", fontWeight: "700" }}>Generating AI Patient...</h2>
          <p style={{ color: "var(--muted)", marginTop: "8px" }}>Creating a custom scenario for your specialty</p>
        </div>
      )}
      
      <header className="container">
        <div className="container2">
          <Logo size={28} dark={false} />
        </div>
        <div className="container-wrapper">
          <nav className="container3">
            <div className="button">
              <Link to="/" className="home" style={{textDecoration:"none", color:"inherit"}}>Home</Link>
            </div>
            <div className="button2">
              <Link to="/simulator" className="simulation" style={{textDecoration:"none", color:"inherit"}}>Simulation</Link>
            </div>
            <div className="button3">
              <Link to="/features" className="patients" style={{textDecoration:"none", color:"inherit"}}>Patients</Link>
            </div>
            <div className="button4">
              <Link to="/dashboard" className="progress" style={{textDecoration:"none", color:"inherit"}}>Progress</Link>
            </div>
          </nav>
        </div>
        <button className="container4" onClick={handleLogout} title="Logout">
          <div className="dr">{user.name.substring(0, 2).toUpperCase()}</div>
        </button>
      </header>
      
      <main className="frame-parent">
        <section className="frame-group">
          <div className="tests-wrapper">
            <h3 className="tests">Tests</h3>
          </div>
          
          {activeCase?.recommendedTests?.length > 0 ? (
            <div className="urine-parent" style={{ overflowY: "auto", justifyContent: "flex-start" }}>
              <h1 className="urine" style={{fontSize:"20px"}}>Recommended</h1>
              {activeCase.recommendedTests.map((test, i) => (
                <div className="test1-100" key={i}>{test}</div>
              ))}
            </div>
          ) : (
            <div className="urine-parent" style={{ justifyContent: "center" }}>
              <div className="test1-100">No tests yet.</div>
            </div>
          )}

          {activeCase?.redFlags?.length > 0 && (
            <div className="blood-parent" style={{ overflowY: "auto", justifyContent: "flex-start" }}>
              <h2 className="urine" style={{ color: "#dc2626", fontSize:"20px" }}>Red Flags</h2>
              {activeCase.redFlags.map((flag, i) => (
                <div className="test1-100" key={i}>{flag}</div>
              ))}
            </div>
          )}
          
          <div className="action-buttons-parent">
            <button className="action-buttons" onClick={async () => {
              const specialtyParam = user.specialization ? `?specialty=${encodeURIComponent(user.specialization)}` : "";
              const data = await api(`/api/cases${specialtyParam}`);
              setCases(data.cases);
              if (data.cases.length > 0) loadCase(data.cases[0].id, data.cases, data.cases[0]);
            }}>
              <div className="see-images">New Patient</div>
            </button>
          </div>
        </section>
        
        <section className="frame-container">
          <div className="frame-div">
            <div className="john-michiell-wrapper">
              {cases.length > 1 ? (
                <select 
                  value={activeCase?.id || ""} 
                  onChange={e => loadCase(e.target.value)}
                  style={{ 
                    background: "transparent", border: "none", fontSize: "1.2rem", 
                    fontWeight: 700, color: "var(--text)", cursor: "pointer",
                    padding: "4px 0", outline: "none", fontFamily: "inherit"
                  }}
                >
                  {cases.map(c => (
                    <option key={c.id} value={c.id}>{c.name} — {c.specialty}</option>
                  ))}
                </select>
              ) : (
                <h3 className="john-michiell">{activeCase?.name || "Select Patient"}</h3>
              )}
            </div>
            <div className="cardiology-wrapper">
              <div className="cardiology">{activeCase?.specialty || user.specialization || "General"}</div>
            </div>
            
            <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "8px", background: timeLeft < 60 ? "rgba(239,68,68,0.1)" : "var(--bg)", padding: "6px 12px", borderRadius: "12px", color: timeLeft < 60 ? "#dc2626" : "var(--text)", fontWeight: "600" }}>
              <span style={{ fontSize: "1.2rem" }}>??</span>
              {formatTime(timeLeft)}
            </div>
          </div>
          
          <div className="frame-parent2" ref={chatLogRef} style={{flexDirection:"column", overflowY:"auto", flex:1, paddingRight:"10px", paddingBottom:"100px"}}>
            {messages.map((m, idx) => (
              m.role === "user" ? (
                <div key={idx} className="frame-parent3" style={{alignSelf:"flex-end", marginBottom:"10px"}}>
                  <div className="frame-wrapper2" style={{paddingTop:"0"}}>
                    <div className="what-other-symptoms-you-have-wrapper" style={{height:"auto"}}>
                      <div className="doctor-iam-having">{m.content}</div>
                    </div>
                  </div>
                  <div className="polygon-parent">
                  </div>
                </div>
              ) : (
                <div key={idx} className="frame-wrapper" style={{alignSelf:"flex-start", paddingTop:"0", marginBottom:"10px"}}>
                  <div className="doctor-iam-having-chest-pain-wrapper" style={{height:"auto", width:"auto", maxWidth:"80%"}}>
                    <div className="doctor-iam-having">{m.content}</div>
                  </div>
                </div>
              )
            ))}
            {loading && !evaluation && (
               <div className="frame-wrapper" style={{alignSelf:"flex-start", paddingTop:"0", marginBottom:"10px"}}>
                  <div className="doctor-iam-having-chest-pain-wrapper" style={{height:"auto", width:"auto"}}>
                    <div className="typing-dots"><span></span><span></span><span></span></div>
                  </div>
                </div>
            )}
          </div>
        </section>
        
        <section className="patient-data-summary-parent">
          <div className="patient-data-summary" style={{height:"auto", minHeight:"149px"}}>
            <div className="summary-descriptors">
              <div className="years">{activeCase?.age || "—"} Years {activeCase?.gender === "Female" ? "?" : "?"}</div>
            </div>
            <div className="summary-descriptors2" style={{
              background: activeCase?.urgency?.includes("critical") || activeCase?.urgency?.includes("Urgent") 
                  ? "rgba(239,68,68,0.1)" : "#f2fef4",
              color: activeCase?.urgency?.includes("critical") || activeCase?.urgency?.includes("Urgent") 
                  ? "#dc2626" : "#096"
            }}>
              <div className="doctor-iam-having">{activeCase?.urgency || "Stable State"}</div>
            </div>
            <div className="nervous-irritable-defensive">
              {activeCase?.personality || "Loading..."}
            </div>
          </div>
          <div className="frame-parent4">
            <button className="hints-wrapper" onClick={handleHint}>
              <div className="see-images">Hints</div>
            </button>
            <button className="abort-case-wrapper" onClick={() => activeCase && loadCase(activeCase.id)}>
              <div className="abort-case">Abort case</div>
            </button>
          </div>
        </section>
        
        <div className="frame-wrapper3" style={{position:"absolute", right:"20px", bottom:"20px", zIndex:10}}>
          <button className="make-diagnosis-wrapper" onClick={() => setIsAssessmentModalOpen(true)}>
            <div className="make-diagnosis">{evaluation ? "View Report" : "Make Diagnosis"}</div>
          </button>
        </div>
      </main>
      
      {!evaluation && (
        <div className="frame-parent5" style={{position:"absolute", bottom:"20px", left:"300px", right:"280px", width:"auto", zIndex:5}}>
          <form onSubmit={sendMessage} style={{display:"flex", width:"100%", alignItems:"center", gap:"10px"}}>
            <input
              className="frame-input"
              placeholder="Write your question here..."
              type="text"
              value={question}
              onChange={e => setQuestion(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
              style={{flex:1}}
            />
            <button className="button5" type="submit" disabled={loading || !question.trim()}>
              <SendIcon />
            </button>
          </form>
        </div>
      )}
      
      {/* Modals are kept as is from original code */}
"""

# We replace the entire return statement starting from `return (` up to the end of the file.
# But we need to keep the modals at the end.
match = re.search(r"return \(\s*<div className=\"figma-chat-bot\">(.*?){\/\* --- Assessment & Feedback Modal --- \*\/}(.*?)\);\s*}", sim_jsx, re.DOTALL)
if match:
    modals = "{/* --- Assessment & Feedback Modal --- */}" + match.group(2)
    new_return = new_return + modals + ");\n}\n"
    sim_jsx = sim_jsx[:match.start()] + new_return
else:
    print("Could not find the return statement to replace.")

with open("frontend/src/pages/Simulator.jsx", "w", encoding="utf-8") as f:
    f.write(sim_jsx)

print("Injected new UI layout into Simulator.jsx")


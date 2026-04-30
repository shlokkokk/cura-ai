import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../cura-global.css";
import "../cura.css";
import Navbar from "../components/Navbar";

export default function Landing() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleStartPracticing = () => {
    if (user) navigate("/simulator");
    else navigate("/login");
  };

  return (
    <>

    <div className="desktop2">
      <Navbar />
      <div className="button10">
        <img className="icon3" alt="" src="/Icon2.svg" />
      </div>
      <section className="curaai-web-app-ui-design2">
        <main className="body2">
          <div className="app3">
            <div className="container9">
              <div className="section2">
                <section className="container10">
                  <div className="heading-1-group">
                    <div className="heading-13">
                      <h2 className="practice-medicine-with3">
                        Practice medicine with
                      </h2>
                      <div className="realistic-ai-patients-container">
                        <h2 className="realistic-ai-patients2">
                          realistic AI patients
                        </h2>
                      </div>
                    </div>
                    <div className="paragraph2">
                      <div className="master-clinical-decision-makin2">
                        Master clinical decision-making through interactive case
                        simulations. Get instant feedback and improve your
                        diagnostic skills.
                      </div>
                    </div>
                  </div>
                  <div className="container-frame">
                    <div className="container11">
                      <button className="button11" onClick={handleStartPracticing}>
                        <div className="icon-container">
                          <img className="icon4" alt="" src="/Icon1.svg" />
                        </div>
                        <div className="start-practicing2">Start Practicing</div>
                      </button>
                      <button className="button12" onClick={handleStartPracticing}>
                        <div className="try-demo-case2">Try Demo Case</div>
                      </button>
                    </div>
                  </div>
                </section>
                <div className="container-wrapper2">
                  <video
                    className="container-icon2"
                    src="/222.mp4"
                    autoPlay
                    loop
                    muted
                    playsInline
                    style={{ objectFit: 'cover', borderRadius: '24px', transform: 'scale(1.02)', clipPath: 'inset(0px 0px 30px 0px)' }}
                  />
                </div>
              </div>
              <div className="how-it-works-group">
                <h2 className="how-it-works2">How it works?</h2>
                <section className="bxsoffer-parent">
                  <div className="bxsoffer">
                    <h2 className="placeholders">1</h2>
                    <img
                      className="vector-icon8"
                      loading="lazy"
                      alt=""
                      src="/Vector.svg"
                    />

                    <div className="choose-a-patient3">Choose <br />a Patient</div>
                  </div>
                  <div className="parent2">
                    <h2 className="placeholders">2</h2>
                    <img
                      className="vector-icon9"
                      alt=""
                      src="/Vector1.svg"
                    />

                    <div className="choose-a-patient3">
                      Take History<br />& Ask Questions
                    </div>
                  </div>
                  <div className="parent3">
                    <h2 className="placeholders">3</h2>
                    <img
                      className="frame-inner"
                      loading="lazy"
                      alt=""
                      src="/Group-1.svg"
                    />

                    <div className="choose-a-patient3">
                      Diagnose<br />& Get Feedback
                    </div>
                  </div>
                </section>
              </div>
              <div className="feature-container-parent">
                <div className="feature-container">
                  <h2 className="features3">Features</h2>
                </div>
                <div className="chair">
                  <div className="vector-parent">
                    <img
                      className="vector-icon10"
                      alt=""
                      src="/Vector2.svg"
                    />

                    <div className="safe-practice-parent">
                      <h3 className="safe-practice2">Safe Practice</h3>
                      <div className="learn-and-make2">
                        Learn and make mistakes in a risk-free environment.
                      </div>
                    </div>
                  </div>
                  <div className="km">
                    <img
                      className="vector-icon11"
                      alt=""
                      src="/Vector3.svg"
                    />

                    <div className="smart-ai-patients-group">
                      <h3 className="safe-practice2">Smart AI Patients</h3>
                      <div className="interact-with-realistic2">
                        Interact with realistic patients that respond
                        dynamically.
                      </div>
                    </div>
                  </div>
                  <div className="frame-parent8">
                    <img
                      className="group-icon"
                      loading="lazy"
                      alt=""
                      src="/Group-3.svg"
                    />

                    <div className="multi-specialties-group">
                      <h3 className="safe-practice2">Multi-Specialties</h3>
                      <div className="explore-cases-across2">
                        Explore cases across different medical fields.
                      </div>
                    </div>
                  </div>
                  <div className="frame-parent9">
                    <img
                      className="frame-child2"
                      loading="lazy"
                      alt=""
                      src="/Group-2.svg"
                    />

                    <div className="progress-tracking-group">
                      <h3 className="safe-practice2">Progress Tracking</h3>
                      <div className="monitor-your-performance2">
                        Monitor your performance and improve over time
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="frame-parent10">
                <div className="wrapper5">
                  <b className="b4">1</b>
                </div>
                <div className="vector-wrapper3">
                  <img className="vector-icon12" alt="" src="/Vector.svg" />
                </div>
                <div className="choose-a-patient4">Choose <br />a Patient</div>
              </div>
              <div className="frame-parent11">
                <div className="wrapper6">
                  <b className="b4">2</b>
                </div>
                <div className="vector-wrapper4">
                  <img
                    className="vector-icon13"
                    alt=""
                    src="/Vector1.svg"
                  />
                </div>
                <div className="choose-a-patient4">
                  Take History<br />& Ask Questions
                </div>
              </div>
              <div className="frame-parent12">
                <div className="wrapper6">
                  <b className="b4">3</b>
                </div>
                <div className="frame-wrapper2">
                  <img
                    className="frame-child3"
                    alt=""
                    src="/Group-11.svg"
                  />
                </div>
                <div className="choose-a-patient4">
                  Diagnose<br />& Get Feedback
                </div>
              </div>
            </div>
            <div className="app-inner">
              <div className="image-wrapper">
                <div className="image">
                  <h2 className="our-users-reviews2">Our Users Reviews</h2>
                </div>
              </div>
            </div>
            <div className="app-child">
              <div className="dark-gray-wingback-c-parent">
                {[1, 2].map((key) => (
                  <React.Fragment key={key}>
                    <section className="dark-gray-wingback-c">
                  <div className="wrapper8">
                    <h2 className="h27">“</h2>
                  </div>
                  <div className="mappin">
                    <div className="profile-details">
                      <img
                        className="vector-icon14"
                        alt=""
                        src="/Vector4.svg"
                      />
                    </div>
                    <div className="profile-infos">
                      <div className="name-name-frame">
                        <h2 className="name-name4">Sarah Jenkins</h2>
                      </div>
                      <div className="medical-student-at-harvard-uni-container">
                        <div className="medical-student-at2">
                          Medical Student at Harvard University
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="it-feels-like-osce-this-help-container">
                    <div className="it-feels-like2">
                      It feels like OSCE !<br />This helped me a lot in my study
                      and in exam cases.
                    </div>
                  </div>
                </section>
                <section className="dark-gray-wingback-c">
                  <div className="km2">
                    <h2 className="h28">“</h2>
                  </div>
                  <div className="frame-parent13">
                    <div className="profile-details">
                      <img
                        className="vector-icon15"
                        alt=""
                        src="/Vector5.svg"
                      />
                    </div>
                    <div className="frame-parent14">
                      <div className="name-name-frame">
                        <h2 className="name-name4">Dr. Mark Thorne</h2>
                      </div>
                      <div className="medical-student-at-harvard-uni-container">
                        <div className="medical-student-at2">
                          Intern Doctor in Oxford University
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="saves-a-lot-of-practicing-time-container">
                    <div className="saves-a-lot2">
                      Saves a lot of practicing time!<br />I can safely practice
                      and make mistakes to learn.
                    </div>
                  </div>
                </section>
                <section className="dark-gray-wingback-c">
                  <div className="wrapper9">
                    <h1 className="h28">“</h1>
                  </div>
                  <div className="mappin">
                    <div className="profile-details">
                      <img
                        className="vector-icon16"
                        alt=""
                        src="/Vector6.svg"
                      />
                    </div>
                    <div className="chair-parent">
                      <div className="name-name-frame">
                        <h2 className="name-name4">Dr. Elena Rodriguez</h2>
                      </div>
                      <div className="medical-student-at-harvard-uni-container">
                        <div className="medical-student-at2">
                          Resident Doctor in Ain Shams University
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="easiest-way-to-get-more-experi-container">
                    <h3 className="easiest-way-to2">
                      Easiest way to get more experience!<br />I can learn about
                      all diseases in one place.
                    </h3>
                  </div>
                </section>
                  </React.Fragment>
                ))}
              </div>
            </div>
            <div className="km3">
              <div className="take-the-next-step-start-your-wrapper">
                <h1 className="take-the-next-container2">
                  Take the next step<br />
                  Start your First Case
                </h1>
              </div>
              <div className="start-sharpening-your-medical-container">
                <div className="start-sharpening-your2">
                  Start sharpening your medical skills
                </div>
              </div>
              <button className="button13" onClick={handleStartPracticing}>
                <div className="sign-up2">SIGN UP!</div>
              </button>
            </div>
            <footer className="footer-1-group">
              <div className="footer-12">
                <div className="container12">
                  <img
                    className="asset-1-12"
                    loading="lazy"
                    alt=""
                    src="/Asset-1-1@2x.png"
                  />

                  <div className="content2">
                    <div className="text2">
                      <div className="company2">
                        <h2 className="curaai2">CURA.AI</h2>
                      </div>
                      <div className="practice-medicine-with4">
                        Practice medicine with realistic AI patients
                      </div>
                    </div>
                    <div className="social-links2">
                      <img
                        className="social-link-12"
                        alt=""
                        src="/Social-link-1.svg"
                      />

                      <img
                        className="social-link-22"
                        alt=""
                        src="/Social-link-2.svg"
                      />

                      <img
                        className="social-link-22"
                        alt=""
                        src="/Social-link-3.svg"
                      />
                    </div>
                  </div>
                  <div className="nav2">
                    <div className="column-12">
                      <div className="header4">
                        <div className="features4">Features</div>
                      </div>
                    </div>
                    <div className="column-22">
                      <div className="header5">
                        <div className="features4">Learn more</div>
                      </div>
                      <div className="start-sharpening-your2">Case library</div>
                      <div className="start-sharpening-your2">Emergency mode</div>
                      <div className="start-sharpening-your2">Users Reviews</div>
                    </div>
                    <div className="column-22">
                      <div className="header5">
                        <div className="features4">Support</div>
                      </div>
                      <div className="start-sharpening-your2">Contact</div>
                      <div className="start-sharpening-your2">Support</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="auramed2026-container">
                <div className="medical-student-at2">© Synapse Team 2026</div>
              </div>
            </footer>
          </div>
        </main>
      </section>
    </div>
  
    </>
  );
}

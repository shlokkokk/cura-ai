import { Link } from 'react-router-dom';
import Logo from './Logo';

export default function Footer() {
  return (
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
  );
}

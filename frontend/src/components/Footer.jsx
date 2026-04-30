import { Link } from 'react-router-dom';
import Logo from './Logo';

export default function Footer() {
  return (
    <footer className="footer" style={{ borderTop: '1px solid var(--border)', paddingTop: '60px', background: 'var(--bg)' }}>
      <div className="footer-container">
        <div className="footer-brand">
          <div style={{ marginBottom: '20px' }}>
            <Logo size={32} dark={false} />
          </div>
          <p style={{color: 'var(--muted)', fontSize: '0.95rem', lineHeight: '1.6', maxWidth: '300px'}}>Empowering medical professionals with AI-driven patient simulations for safer, smarter healthcare.</p>
        </div>
        <div className="footer-links" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
          <div className="footer-col">
            <h4 style={{ color: 'var(--text)', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '1px', marginBottom: '16px' }}>Product</h4>
            <Link to="/features" style={{ display: 'block', color: 'var(--muted)', textDecoration: 'none', marginBottom: '12px' }}>Features</Link>
          </div>
          <div className="footer-col">
            <h4 style={{ color: 'var(--text)', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '1px', marginBottom: '16px' }}>Company</h4>
            <Link to="/about" style={{ display: 'block', color: 'var(--muted)', textDecoration: 'none', marginBottom: '12px' }}>About Us</Link>
            <a href="#" style={{ display: 'block', color: 'var(--muted)', textDecoration: 'none', marginBottom: '12px' }}>Careers</a>
            <a href="#" style={{ display: 'block', color: 'var(--muted)', textDecoration: 'none', marginBottom: '12px' }}>Contact</a>
          </div>
          <div className="footer-col">
            <h4 style={{ color: 'var(--text)', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '1px', marginBottom: '16px' }}>Legal</h4>
            <a href="#" style={{ display: 'block', color: 'var(--muted)', textDecoration: 'none', marginBottom: '12px' }}>Privacy Policy</a>
            <a href="#" style={{ display: 'block', color: 'var(--muted)', textDecoration: 'none', marginBottom: '12px' }}>Terms of Service</a>
          </div>
        </div>
      </div>
      <div className="footer-bottom" style={{ marginTop: '60px', padding: '24px 0', borderTop: '1px solid var(--border)', textAlign: 'center', color: 'var(--muted)', fontSize: '0.85rem' }}>
        <p>&copy; {new Date().getFullYear()} Cura AI. All rights reserved. Built for Hackathon.</p>
      </div>
    </footer>
  );
}

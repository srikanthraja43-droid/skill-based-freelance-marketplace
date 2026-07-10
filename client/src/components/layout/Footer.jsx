import { Link } from "react-router-dom";
export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <div className="footer-brand"><span>⚡</span><span className="text-gradient">SkillMarket</span></div>
            <p className="footer-desc">Connecting local skilled professionals with clients who need them. Your neighborhood, your experts.</p>
          </div>
          <div><h4>Platform</h4><ul><li><Link to="/search">Find Services</Link></li><li><Link to="/signup?role=provider">Become a Provider</Link></li><li><Link to="/login">Sign In</Link></li></ul></div>
          <div><h4>Categories</h4><ul><li>Plumbing</li><li>Electrical</li><li>Tutoring</li><li>IT Support</li><li>Cleaning</li></ul></div>
          <div><h4>Legal</h4><ul><li>Privacy Policy</li><li>Terms of Service</li><li>Cookie Policy</li></ul></div>
        </div>
        <div className="footer-bottom"><p>&copy; {new Date().getFullYear()} SkillMarket. Built with ❤️ for local communities.</p></div>
      </div>
    </footer>
  );
}

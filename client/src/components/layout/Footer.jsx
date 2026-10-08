import { Link } from "react-router-dom";
export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <div className="footer-brand">
              <svg width="24" height="24" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 2L32 10.0718V25.9282L18 34L4 25.9282V10.0718L18 2Z" fill="#635BFF"/>
                <path d="M18 8L26 12.6188V21.8542L18 26.473L10 21.8542V12.6188L18 8Z" fill="white" fillOpacity="0.25"/>
                <path d="M18 13.5L22 15.8094V20.4281L18 22.7375L14 20.4281V15.8094L18 13.5Z" fill="white"/>
              </svg>
              <span style={{ color: "#0F172A" }}>SkillHive</span>
            </div>
            <p className="footer-desc">Connecting skilled freelancers with clients worldwide. Find talent, post projects, and grow your career — all in one place.</p>
          </div>
          <div><h4>Platform</h4><ul><li><Link to="/search">Find Talent</Link></li><li><Link to="/signup?role=provider">Become a Seller</Link></li><li><Link to="/login">Sign In</Link></li><li>How It Works</li></ul></div>
          <div><h4>Categories</h4><ul><li><Link to="/search?category=Web Development">Web Development</Link></li><li><Link to="/search?category=UI/UX Design">UI/UX Design</Link></li><li><Link to="/search?category=Digital Marketing">Digital Marketing</Link></li><li><Link to="/search?category=Content Writing">Content Writing</Link></li><li><Link to="/search?category=Graphic Design">Graphic Design</Link></li></ul></div>
          <div><h4>Support</h4><ul><li>Help Center</li><li>Privacy Policy</li><li>Terms of Service</li><li>Cookie Policy</li></ul></div>
        </div>
        <div className="footer-bottom"><p>&copy; {new Date().getFullYear()} SkillHive. All rights reserved.</p></div>
      </div>
    </footer>
  );
}

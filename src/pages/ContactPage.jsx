import React from 'react';
import { useNavigate } from 'react-router-dom';

const ContactPage = () => {
  const navigate = useNavigate();

  return (
    <div className="page">
      {/* Nav */}
      <nav className="page-nav">
        <a href="#" className="page-nav-logo" onClick={(e) => { e.preventDefault(); navigate('/'); }}>JT</a>
        <div className="page-nav-links">
          <a href="#" onClick={(e) => { e.preventDefault(); navigate('/'); }}>Home</a>
          <a href="#" onClick={(e) => { e.preventDefault(); navigate('/about'); }}>About</a>
          <a href="#" onClick={(e) => { e.preventDefault(); navigate('/projects'); }}>Projects</a>
          <a href="#" className="active">Contact</a>
        </div>
      </nav>

      <main className="page-main">
        <section className="page-hero">
          <span className="page-hero-label">Get in Touch</span>
          <h1 className="page-hero-title">Contact<span>.</span></h1>
        </section>

        {/* Add your content here */}
        
      </main>
    </div>
  );
};

export default ContactPage;

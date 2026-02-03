import React from 'react';
import { useNavigate } from 'react-router-dom';

const AboutPage = () => {
  const navigate = useNavigate();

  return (
    <div className="page">
      {/* Nav */}
      <nav className="page-nav">
        <a href="#" className="page-nav-logo" onClick={(e) => { e.preventDefault(); navigate('/'); }}>JT</a>
        <div className="page-nav-links">
          <a href="#" onClick={(e) => { e.preventDefault(); navigate('/'); }}>Home</a>
          <a href="#" className="active">About</a>
          <a href="#" onClick={(e) => { e.preventDefault(); navigate('/projects'); }}>Projects</a>
          <a href="#" onClick={(e) => { e.preventDefault(); navigate('/contact'); }}>Contact</a>
        </div>
      </nav>

      <main className="page-main">
        <section className="page-hero">
          <span className="page-hero-label">About Me</span>
          <h1 className="page-hero-title">About<span>.</span></h1>
        </section>

        {/* Add your content here */}
        
      </main>
    </div>
  );
};

export default AboutPage;

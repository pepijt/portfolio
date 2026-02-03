import React from 'react';
import { useNavigate } from 'react-router-dom';

const ContactPage = () => {
  const navigate = useNavigate();

  const contacts = [
    {
      id: 1,
      label: "Email",
      value: "jting9@jh.edu",
      link: "mailto:jting9@jh.edu"
    },
    {
      id: 2,
      label: "LinkedIn",
      value: "linkedin.com/in/joyceting",
      link: "https://linkedin.com/in/joyceting"
    },
    {
      id: 3,
      label: "GitHub",
      value: "github.com/joyceting",
      link: "https://github.com/joyceting"
    },
    {
      id: 4,
      label: "Location",
      value: "Baltimore, MD",
      link: null
    }
  ];

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
        {/* Hero */}
        <section className="page-hero">
          <span className="page-hero-label">Get in Touch</span>
          <h1 className="page-hero-title">Contact<span>.</span></h1>
        </section>

        {/* Contact Links */}
        <section className="page-section">
          <div className="contact-list">
            {contacts.map((contact) => (
              contact.link ? (
                <a 
                  key={contact.id} 
                  href={contact.link}
                  target={contact.link.startsWith('mailto') ? undefined : '_blank'}
                  rel={contact.link.startsWith('mailto') ? undefined : 'noopener noreferrer'}
                  className="contact-item"
                >
                  <div className="contact-label">{contact.label}</div>
                  <div className="contact-value">{contact.value}</div>
                </a>
              ) : (
                <div key={contact.id} className="contact-item">
                  <div className="contact-label">{contact.label}</div>
                  <div className="contact-value">{contact.value}</div>
                </div>
              )
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default ContactPage;

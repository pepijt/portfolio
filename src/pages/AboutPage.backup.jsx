import React from 'react';
import { useNavigate } from 'react-router-dom';

const AboutPage = () => {
  const navigate = useNavigate();

  const education = [
    {
      id: 1,
      year: "2027",
      status: "Expected",
      school: "Johns Hopkins University",
      degree: "MSE, Biomedical Engineering"
    },
    {
      id: 2,
      year: "2025",
      status: "Graduated",
      school: "University of British Columbia",
      degree: "BSc, Neuroscience (with Distinction)"
    }
  ];

  const skills = {
    designFab: ["Fusion 360", "FDM Printing", "SLA Printing", "Bioprinting", "CAD/CAM"],
    electronics: ["Arduino", "Circuit Design", "Sensors", "ECG/EMG", "Signal Processing"]
  };

  const experiences = [
    {
      id: 1,
      date: "2025 — Now",
      location: "Baltimore, MD",
      title: "Biomedical Instrumentation Design",
      org: "Johns Hopkins — Dr. Nitish Thakor",
      description: "Developed head-mounted controller for users with quadriplegia. Engineered AI-enabled wristband for deaf users with real-time hazard detection."
    },
    {
      id: 2,
      date: "2024 — 2025",
      location: "Vancouver",
      title: "Research Assistant",
      org: "Laver Group, UBC & Maxwell Therapeutics",
      description: "Engineered custom devices for hPSC culture and bioprinting. Rapidly prototyped hardware using FDM and SLA printers."
    },
    {
      id: 3,
      date: "2024 — 2025",
      location: "Vancouver",
      title: "Capstone Researcher",
      org: "UBC Neuroscience Program",
      description: "Created pseudo-macula through bioprinting for treating blindness. Managed end-to-end fabrication workflow."
    },
    {
      id: 4,
      date: "2025",
      location: "Vancouver",
      title: "Teaching Assistant",
      org: "UBC NSCI 300: Computational Neuroscience",
      description: "Mentored 30+ students in programming and computational neuroscience."
    }
  ];


  return (
    <div className="about-page">
      {/* Nav */}
      <nav className="about-nav">
        <a href="#" className="about-nav-logo" onClick={(e) => { e.preventDefault(); navigate('/'); }}>JT</a>
        <div className="about-nav-links">
          <a href="#" onClick={(e) => { e.preventDefault(); navigate('/'); }}>Home</a>
          <a href="#" className="active">About</a>
          <a href="#" onClick={(e) => { e.preventDefault(); navigate('/projects'); }}>Projects</a>
          <a href="#" onClick={(e) => { e.preventDefault(); navigate('/contact'); }}>Contact</a>
        </div>
      </nav>

      <main className="about-main">
        {/* Hero */}
        <section className="about-hero">
          <div className="about-hero-main">
            <span className="about-hero-label">About Me</span>
            <h1 className="about-hero-name">Joyce<span>.</span><br />Ting</h1>
          </div>
          <div className="about-hero-contact">
            <div className="about-contact-item"><a href="mailto:jting9@jh.edu">jting9@jh.edu</a></div>
            <div className="about-contact-item">Baltimore, MD</div>
          </div>
        </section>

        {/* Education */}
        <section className="about-section">
          <div className="about-section-header">
            <span className="about-section-number">01</span>
            <h2 className="about-section-title">Education</h2>
          </div>

          <div className="about-edu-list">
            {education.map((edu) => (
              <div key={edu.id} className="about-edu-item">
                <div className="about-edu-years">
                  {edu.year} <span>{edu.status}</span>
                </div>
                <div className="about-edu-content">
                  <h3>{edu.school}</h3>
                  <p>{edu.degree}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Skills */}
        <section className="about-section">
          <div className="about-section-header">
            <span className="about-section-number">02</span>
            <h2 className="about-section-title">Skills</h2>
          </div>

          <div className="about-skills-wrap">
            <div className="about-skill-category yellow">
              <h3>Design & Fabrication</h3>
              <div className="about-skill-tags">
                {skills.designFab.map((skill) => (
                  <span key={skill} className="about-skill-tag">{skill}</span>
                ))}
              </div>
            </div>
            <div className="about-skill-category purple">
              <h3>Electronics & Signals</h3>
              <div className="about-skill-tags">
                {skills.electronics.map((skill) => (
                  <span key={skill} className="about-skill-tag">{skill}</span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Experience */}
        <section className="about-section">
          <div className="about-section-header">
            <span className="about-section-number">03</span>
            <h2 className="about-section-title">Experience</h2>
          </div>

          <div className="about-exp-list">
            {experiences.map((exp, index) => (
              <div key={exp.id} className="about-exp-item" style={index === 0 ? { paddingTop: 0 } : {}}>
                <div className="about-exp-meta">
                  <div className="about-exp-date">{exp.date}</div>
                  <div className="about-exp-location">{exp.location}</div>
                </div>
                <div className="about-exp-content">
                  <h3>{exp.title}</h3>
                  <h4>{exp.org}</h4>
                  <p>{exp.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

      </main>
    </div>
  );
};

export default AboutPage;

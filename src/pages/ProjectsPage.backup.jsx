import React from 'react';
import { useNavigate } from 'react-router-dom';

const ProjectsPage = () => {
  const navigate = useNavigate();

  const projects = [
    {
      id: 1,
      title: "Head-Mounted Controller",
      description: "Developed assistive device for users with quadriplegia, enabling hands-free computer control through head movements and gestures.",
      tags: ["Arduino", "3D Printing", "Sensors"]
    },
    {
      id: 2,
      title: "AI Wristband for Deaf Users",
      description: "Engineered wearable device with real-time hazard detection and haptic feedback for deaf and hard-of-hearing users.",
      tags: ["Machine Learning", "Embedded Systems", "UX Design"]
    },
    {
      id: 3,
      title: "Bioprinted Pseudo-Macula",
      description: "Created retinal tissue construct through bioprinting for treating age-related macular degeneration and blindness.",
      tags: ["Bioprinting", "Cell Culture", "CAD"]
    },
    {
      id: 4,
      title: "hPSC Culture Devices",
      description: "Designed and fabricated custom hardware for human pluripotent stem cell culture and differentiation workflows.",
      tags: ["FDM Printing", "SLA Printing", "Fusion 360"]
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
          <a href="#" className="active">Projects</a>
          <a href="#" onClick={(e) => { e.preventDefault(); navigate('/contact'); }}>Contact</a>
        </div>
      </nav>

      <main className="page-main">
        {/* Hero */}
        <section className="page-hero">
          <span className="page-hero-label">Portfolio</span>
          <h1 className="page-hero-title">Projects<span>.</span></h1>
        </section>

        {/* Projects List */}
        <section className="page-section">
          <div className="about-exp-list">
            {projects.map((project, index) => (
              <div key={project.id} className="project-item" style={index === 0 ? { paddingTop: 0 } : {}}>
                <div className="project-number">0{index + 1}</div>
                <div className="project-content">
                  <h3>{project.title}</h3>
                  <p>{project.description}</p>
                  <div className="project-tags">
                    {project.tags.map((tag) => (
                      <span key={tag} className="project-tag">{tag}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default ProjectsPage;

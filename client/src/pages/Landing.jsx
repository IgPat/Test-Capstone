import react from 'react';
import { Link } from 'react-router-dom';
import { useState } from 'react';

const features = [
  { icon: '🎓', title: 'Student Records', text: 'Full profiles — bio-data, guardian info, class placement, enrollment history — searchable and paginated.' },
  { icon: '🏫', title: 'Class Management', text: 'Create classes, assign subjects and homerooms, enroll or unenroll students in a click.' },
  { icon: '📋', title: 'Attendance Tracking', text: 'Mark present, absent, late or excused per class, per day. Students see their own attendance rate.' },
  { icon: '📊', title: 'Grades & Report Cards', text: 'Record scores per subject and term. Averages and grade letters are calculated automatically.' },
  { icon: '💳', title: 'Fees & Invoicing', text: 'Generate invoices, log partial payments, and track outstanding balances — simulated payments, no gateway needed.' },
  { icon: '🔔', title: 'Announcements & Notifications', text: 'Broadcast to the whole school or a single class, with an in-app bell and unread counter.' },
];

const testimonials = [
  { quote: 'Attendance that used to take 20 minutes on paper now takes two.', name: 'Mrs. Adeyemi', role: 'Vice Principal, Greenfield Academy' },
  { quote: 'I can check my report card and fee balance the moment I log in — no more waiting on the office.', name: 'Tomiwa O.', role: 'JSS2 Student' },
  { quote: 'One dashboard for the whole school. Onboarding new staff takes an afternoon, not a week.', name: 'Mr. Bello', role: 'School Administrator' },
];

const faqs = [
  { q: 'Is my data secure?', a: 'Passwords are hashed with bcrypt and never stored in plain text. Every request is authenticated with a signed JWT, and role-based middleware enforces who can see what.' },
  { q: 'Can parents use this too?', a: 'The current release supports Admin and Student roles. Parent and Teacher roles are on our roadmap.' },
  { q: 'Do payments go through a real gateway?', a: 'Not yet — the fees module simulates invoicing and payment recording so schools can trial the workflow before connecting a live processor.' },
  { q: 'Can I try it before rolling it out school-wide?', a: 'Yes. Register a student account instantly, or ask an administrator for demo admin access.' },
];

const FaqItem = ({ q, a }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="faq-item">
      <button className="faq-question" onClick={() => setOpen(!open)}>
        <span>{q}</span>
        <span className="faq-toggle">{open ? '−' : '+'}</span>
      </button>
      {open && <p className="faq-answer">{a}</p>}
    </div>
  );
};

const Landing = () => {
  return (
    <div className="landing">
      <header className="landing-nav">
        <div className="landing-nav-inner">
          <span className="brand">🏫 SMS</span>
          <nav className="landing-links">
            <a href="#about">About</a>
            <a href="#features">Features</a>
            <a href="#testimonials">Testimonials</a>
            <a href="#faq">FAQ</a>
            <a href="#contact">Contact</a>
          </nav>
          <div className="landing-actions">
            <Link to="/login" className="btn-secondary">Log in</Link>
            <Link to="/register" className="btn-primary">Get started</Link>
          </div>
        </div>
      </header>

      <section className="hero">
        <div className="hero-text">
          <h1>Run your school's academics from one dashboard.</h1>
          <p>
            Students, classes, attendance, grades, fees and announcements —
            digitized for administrators, and self-service for students.
          </p>
          <div className="hero-cta">
            <Link to="/register" className="btn-primary btn-lg">Create a student account</Link>
            <Link to="/login" className="btn-outline btn-lg">Admin / Student log in</Link>
          </div>
        </div>
        <div className="hero-art" aria-hidden="true">
          <div className="hero-card">📊 Attendance rate today: 96%</div>
          <div className="hero-card">🧾 Fees collected: ₦2,430,000</div>
          <div className="hero-card">📚 128 active classes</div>
        </div>
      </section>

      <section id="about" className="section">
        <h2>About Us</h2>
        <p>
          The School Management System was built to replace scattered spreadsheets,
          paper registers and manual fee ledgers with one connected platform.
          Administrators get full control over academic operations; students get
          instant, self-service access to their own records — no more waiting on
          the front office for a report card or a balance check.
        </p>
      </section>

      <section className="section alt">
        <div className="two-col">
          <div>
            <h2>Our Vision</h2>
            <p>A school where every academic record — attendance, grades, fees, and
              communication — is accurate, current, and one login away for the people
              who need it.</p>
          </div>
          <div>
            <h2>Our Mission</h2>
            <p>To give schools a simple, secure, role-aware system that saves
              administrative time and gives students clear visibility into their
              own academic and financial standing.</p>
          </div>
        </div>
      </section>

      <section className="section">
        <h2>Goals & Philosophy</h2>
        <ul className="goal-list">
          <li>Reduce administrative overhead with real CRUD workflows, not paperwork.</li>
          <li>Protect every record with proper authentication and role-based access.</li>
          <li>Put students in control of viewing (not editing) their own academic data.</li>
          <li>Keep the system simple enough for any school to adopt without training.</li>
        </ul>
      </section>

      <section id="features" className="section alt">
        <h2>Features & Services</h2>
        <div className="feature-grid">
          {features.map((f) => (
            <div className="feature-card" key={f.title}>
              <div className="feature-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="testimonials" className="section">
        <h2>What People Are Saying</h2>
        <div className="testimonial-grid">
          {testimonials.map((t) => (
            <div className="testimonial-card" key={t.name}>
              <p className="quote">"{t.quote}"</p>
              <p className="attribution">— {t.name}, {t.role}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="faq" className="section alt">
        <h2>Frequently Asked Questions</h2>
        <div className="faq-list">
          {faqs.map((f) => <FaqItem key={f.q} {...f} />)}
        </div>
      </section>

      <section id="contact" className="section contact-section">
        <h2>Contact Us</h2>
        <p>Have a question about rolling this out at your school? Reach out.</p>
        <div className="contact-grid">
          <div>📧 support@schoolsms.test</div>
          <div>📞 +234 800 000 0000</div>
          <div>📍 Lagos, Nigeria</div>
        </div>
      </section>

      <footer className="landing-footer">
        <div className="footer-inner">
          <span>© {new Date().getFullYear()} School Management System. All rights reserved.</span>
          <div className="footer-links">
            <a href="#about">About</a>
            <a href="#features">Features</a>
            <a href="#faq">FAQ</a>
            <Link to="/login">Log in</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;

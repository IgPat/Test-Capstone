import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowDownRight,
  ArrowRight,
  BellRing,
  BookOpenCheck,
  CalendarCheck2,
  ChartNoAxesCombined,
  Check,
  ChevronDown,
  ClipboardList,
  GraduationCap,
  LockKeyhole,
  Menu,
  ReceiptText,
  UsersRound,
  X,
} from "lucide-react";
import "./Landing2.css";

const principles = [
  [
    "01",
    "See the whole student",
    "Bring attendance, grades, and school records together to make each student easier to support.",
  ],
  [
    "02",
    "Make information useful",
    "Keep academic details clear, current, and ready when a decision needs to be made.",
  ],
  [
    "03",
    "Keep students in the loop",
    "Give students a direct view of their own school records, updates, and invoices.",
  ],
  [
    "04",
    "Give staff time back",
    "Replace repeat data entry with simple workflows for the work schools do every day.",
  ],
];

const capabilities = [
  {
    icon: UsersRound,
    title: "Student records",
    text: "Keep student profiles, class placement, and enrollment details together in one searchable place.",
    tone: "mint",
  },
  {
    icon: CalendarCheck2,
    title: "Daily attendance",
    text: "Record attendance by class and day, then give students a clear view of their own history.",
    tone: "peach",
  },
  {
    icon: ChartNoAxesCombined,
    title: "Grades and reports",
    text: "Enter subject results, follow term-by-term progress, and publish grades for students to review.",
    tone: "lilac",
  },
  {
    icon: ReceiptText,
    title: "Invoices and fees",
    text: "Create invoices and keep payment records and outstanding balances easy to follow.",
    tone: "lemon",
  },
  {
    icon: LockKeyhole,
    title: "Role-aware access",
    text: "Separate administrator tools from student self-service so people see the right workspace.",
    tone: "lilac",
  },
  {
    icon: BellRing,
    title: "School announcements",
    text: "Share school-wide or class updates and keep notices close to the student dashboard.",
    tone: "mint",
  },
];

const questions = [
  [
    "Who can use the system?",
    "The current workspace supports administrator and student accounts. Each role has its own pages and permissions.",
  ],
  [
    "What can students see?",
    "Students can review their own profile, attendance, grades, invoices, and school announcements after signing in.",
  ],
  [
    "Can I create a student account?",
    "Yes. Use the student registration page to create an account and open the student workspace.",
  ],
  [
    "Does the system support online fee payments?",
    "The system includes invoice and payment workflows. Ask your school administrator which payment options are enabled for your account.",
  ],
];

function Question({ question, answer, open, onToggle }) {
  return (
    <div className={`ed-question${open ? " is-open" : ""}`}>
      <button
        className="ed-question-trigger"
        type="button"
        aria-expanded={open}
        onClick={onToggle}
      >
        <span>{question}</span>
        <ChevronDown size={19} aria-hidden="true" />
      </button>
      {open && <p className="ed-question-answer">{answer}</p>}
    </div>
  );
}

export default function Landing2() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [openQuestion, setOpenQuestion] = useState(0);
  const closeMenu = () => setMenuOpen(false);

  return (
    <main className="educore-page">
      <header className="ed-header">
        <div className="ed-header-inner">
          <Link
            className="ed-brand"
            to="/"
            aria-label="EduCore home"
            onClick={closeMenu}
          >
            <span className="ed-brand-mark">
              <GraduationCap size={22} />
            </span>
            <span>
              EduCore<span className="ed-brand-period">.</span>
            </span>
          </Link>
          <button
            className="ed-menu-toggle"
            type="button"
            aria-label={menuOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
          <nav
            className={`ed-nav${menuOpen ? " is-open" : ""}`}
            aria-label="Main navigation"
          >
            <Link to="/about" onClick={closeMenu}>
              About
            </Link>
            <a href="#capabilities" onClick={closeMenu}>
              Capabilities
            </a>
            <a href="#faq" onClick={closeMenu}>
              FAQs
            </a>
            <Link to="/contact" onClick={closeMenu}>
              Contact
            </Link>
            <Link to="/privacy" onClick={closeMenu}>
              Privacy
            </Link>
            <Link className="ed-nav-login" to="/login" onClick={closeMenu}>
              Log in
            </Link>
            <Link
              className="ed-button ed-button-small"
              to="/register"
              onClick={closeMenu}
            >
              Student sign up <ArrowRight size={15} />
            </Link>
          </nav>
        </div>
      </header>

      <section className="ed-hero" aria-labelledby="ed-hero-title">
        <div className="ed-hero-image" />
        <div className="ed-hero-shade" />
        <div className="ed-hero-content">
          <p className="ed-eyebrow ed-hero-eyebrow">
            <span /> A calmer way to run school
          </p>
          <h1 id="ed-hero-title">
            More time for teaching.
            <br />
            <em>Less time in paperwork.</em>
          </h1>
          <p className="ed-hero-copy">
            The essential school day, connected. Keep student records,
            attendance, grades, invoices, and updates moving in one practical
            workspace.
          </p>
          <div className="ed-hero-actions">
            <Link className="ed-button ed-button-coral" to="/login">
              Open your workspace <ArrowRight size={17} />
            </Link>
            <a className="ed-text-link" href="#capabilities">
              Explore the system <ArrowDownRight size={17} />
            </a>
          </div>
          <div className="ed-hero-note">
            <Check size={15} /> Built around real school routines
          </div>
        </div>
        <div className="ed-hero-caption">
          <span>One connected school day</span>
          <span>01 / 04</span>
        </div>
      </section>

      <div className="ed-facts" aria-label="Platform overview">
        <div className="ed-fact">
          <span className="ed-fact-number">01</span>
          <span>
            Administrator
            <br />
            workspace
          </span>
        </div>
        <div className="ed-fact">
          <span className="ed-fact-number">02</span>
          <span>
            Student
            <br />
            self-service
          </span>
        </div>
        <div className="ed-fact">
          <span className="ed-fact-number">06</span>
          <span>
            Connected school
            <br />
            workflows
          </span>
        </div>
        <div className="ed-fact ed-fact-note">
          <span>
            From the front office
            <br />
            to the classroom.
          </span>
          <ArrowDownRight size={22} />
        </div>
      </div>

      <section className="ed-section ed-about" id="about">
        <div className="ed-about-visual">
          <img
            src="https://res.cloudinary.com/w8kvizbx/image/upload/v1790809175/university-campus-students-walking-class-marshall-public-college-huntington-west-virginia-school-over-years-44502414.webp"
            alt="Students walking together across a university campus"
            loading="lazy"
          />
          <div className="ed-image-label">
            <span className="ed-label-dot" /> A school day, in sync
          </div>
          <div className="ed-about-stamp">
            <BookOpenCheck size={23} />
            <span>
              Room for
              <br />
              learning
            </span>
          </div>
        </div>
        <div className="ed-about-copy">
          <p className="ed-eyebrow">
            <span>01</span> Our approach
          </p>
          <h2>
            Good systems make space for <em>good teaching.</em>
          </h2>
          <p className="ed-body-copy">
            EduCore brings the daily work of school administration into one
            clear place. Instead of chasing paper registers and scattered
            spreadsheets, staff can keep records, classes, and communication
            connected.
          </p>
          <p className="ed-body-copy">
            Students get a useful view of their own progress and school updates,
            while administrators keep control of the records that make the
            school run.
          </p>
          <div className="ed-signoff">
            <span className="ed-signoff-line" />
            Built for the people who make school happen.
          </div>
        </div>
      </section>

      <section className="ed-mission" aria-label="Vision and mission">
        <div className="ed-mission-heading">
          <p className="ed-eyebrow ed-eyebrow-light">
            <span>02</span> What guides us
          </p>
          <h2>
            Clear records.
            <br />
            <em>Better decisions.</em>
          </h2>
        </div>
        <div className="ed-mission-items">
          <article className="ed-mission-item">
            <span className="ed-mission-index">THE VISION</span>
            <h3>A school where the right information is within reach.</h3>
            <p>
              Make everyday academic records dependable, connected, and simple
              to find.
            </p>
          </article>
          <article className="ed-mission-item">
            <span className="ed-mission-index">THE MISSION</span>
            <h3>Useful tools, made for the rhythm of school.</h3>
            <p>
              Give administrators and students a secure, straightforward way to
              manage their part of the school day.
            </p>
          </article>
        </div>
      </section>

      <section className="ed-section ed-principles">
        <div className="ed-section-heading">
          <div>
            <p className="ed-eyebrow">
              <span>03</span> The principles
            </p>
            <h2>
              Small improvements.
              <br />
              <em>A better school day.</em>
            </h2>
          </div>
          <p className="ed-heading-aside">
            A thoughtful system should make the important work easier, not add
            another layer to it.
          </p>
        </div>
        <div className="ed-principle-grid">
          {principles.map(([number, title, text]) => (
            <article className="ed-principle" key={number}>
              <span className="ed-principle-number">{number}</span>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="ed-capabilities" id="capabilities">
        <div className="ed-section ed-capabilities-inner">
          <div className="ed-section-heading ed-capabilities-heading">
            <div>
              <p className="ed-eyebrow">
                <span>04</span> The platform
              </p>
              <h2>
                Everything connected.
                <br />
                <em>Nothing overcomplicated.</em>
              </h2>
            </div>
            <p className="ed-heading-aside">
              Six everyday tools, brought together in one school management
              system.
            </p>
          </div>
          <div className="ed-capability-grid">
            {capabilities.map(({ icon: Icon, title, text, tone }, index) => (
              <article className="ed-capability" key={title}>
                <div className={`ed-capability-icon tone-${tone}`}>
                  <Icon size={21} strokeWidth={1.8} />
                </div>
                <span className="ed-capability-number">0{index + 1}</span>
                <h3>{title}</h3>
                <p>{text}</p>
                <span className="ed-card-rule" />
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="ed-community">
        <div
          className="ed-community-image"
          role="img"
          aria-label="Students studying together in a bright classroom"
        />
        <div className="ed-community-copy">
          <p className="ed-eyebrow">
            <span>05</span> One school community
          </p>
          <h2>
            One system.
            <br />
            <em>Different points of view.</em>
          </h2>
          <div className="ed-community-roles">
            <article>
              <ClipboardList size={19} />
              <div>
                <h3>For administrators</h3>
                <p>Bring school operations into one organized workspace.</p>
              </div>
            </article>
            <article>
              <GraduationCap size={19} />
              <div>
                <h3>For students</h3>
                <p>Check personal records and stay close to school updates.</p>
              </div>
            </article>
            <article>
              <BookOpenCheck size={19} />
              <div>
                <h3>For educators</h3>
                <p>Keep the class information you need clear and current.</p>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className="ed-section ed-faq" id="faq">
        <div className="ed-faq-intro">
          <p className="ed-eyebrow">
            <span>06</span> Good to know
          </p>
          <h2>
            Questions, <em>answered.</em>
          </h2>
          <p>
            Still have a question? Sign in and connect with your school
            administrator.
          </p>
          <Link to="/login" className="ed-faq-link">
            Go to login <ArrowRight size={16} />
          </Link>
        </div>
        <div className="ed-faq-list">
          {questions.map(([question, answer], index) => (
            <Question
              key={question}
              question={question}
              answer={answer}
              open={openQuestion === index}
              onToggle={() =>
                setOpenQuestion((current) => (current === index ? -1 : index))
              }
            />
          ))}
        </div>
      </section>

      <section className="ed-contact">
        <div className="ed-contact-inner">
          <div>
            <p className="ed-eyebrow ed-eyebrow-light">
              <span>07</span> Start here
            </p>
            <h2>
              Make room for
              <br />
              <em>what matters.</em>
            </h2>
          </div>
          <div className="ed-contact-action">
            <p>
              Pick up where your school day begins. Sign in to your workspace or
              create a student account.
            </p>
            <div className="ed-contact-buttons">
              <Link to="/login" className="ed-button ed-button-light">
                Log in <ArrowRight size={17} />
              </Link>
              <Link to="/register" className="ed-contact-register">
                Create student account <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="ed-footer">
        <Link className="ed-brand ed-footer-brand" to="/">
          <span className="ed-brand-mark">
            <GraduationCap size={20} />
          </span>
          <span>
            EduCore<span className="ed-brand-period">.</span>
          </span>
        </Link>
        <span className="ed-footer-note">
          A clearer school day starts here.
        </span>
        <div className="ed-footer-links">
          <Link to="/login">Log in</Link>
          <Link to="/register">Student sign up</Link>
          <Link to="/about">About</Link>
          <Link to="/contact">Contact</Link>
          <Link to="/privacy">Privacy</Link>
          <span>© {new Date().getFullYear()} EduCore</span>
        </div>
      </footer>
    </main>
  );
}
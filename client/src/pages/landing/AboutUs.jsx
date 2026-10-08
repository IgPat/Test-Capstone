import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import PublicSiteFrame from '../../components/PublicSiteFrame';
import '../../components/PublicSiteFrame.css';

const principles = [
  ['01', 'Clarity first', 'Present school information in a way that is understandable and useful to the people who need it.'],
  ['02', 'One connected record', 'Bring student profiles, attendance, grades, invoices, and announcements into a shared workflow.'],
  ['03', 'The right access', 'Keep student self-service and administrator tools separate with role-aware accounts.'],
];

export default function AboutUs() {
  return (
    <PublicSiteFrame>
      <main className="info-page">
        <section className="info-hero"><div className="info-hero-inner">
          <p className="info-kicker">ABOUT EDUCORE</p>
          <h1>A clearer view of the school day.</h1>
          <p>EduCore is a student management system for the everyday work of keeping school records organized and school communities informed.</p>
        </div></section>
        <section className="info-section">
          <div className="info-two-column">
            <div className="info-copy"><p className="info-kicker">WHY WE BUILT IT</p><h2>Less time chasing records. More time supporting students.</h2></div>
            <div className="info-copy"><p>Schools manage a lot of connected details: who is enrolled, who is present, how learning is progressing, what fees are due, and what families need to know. When those details are scattered, routine decisions take longer than they should.</p><p>EduCore brings these core workflows into one practical workspace for school administrators and students. It is designed to make the current picture easier to find and easier to act on.</p></div>
          </div>
        </section>
        <section className="info-section" style={{ paddingTop: 0 }}>
          <div className="info-section-head"><p className="info-kicker">OUR APPROACH</p><h2>Useful, understandable, and built around real routines.</h2></div>
          <div className="info-list">{principles.map(([number, title, text]) => <article key={number}><span>{number}</span><h3>{title}</h3><p>{text}</p></article>)}</div>
        </section>
        <section className="info-band"><div className="info-band-inner"><h2>Have a question about using EduCore at your school?</h2><Link className="info-button" to="/contact">Contact the school team <ArrowRight size={16} /></Link></div></section>
      </main>
    </PublicSiteFrame>
  );
}
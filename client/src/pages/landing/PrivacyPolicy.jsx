import { Link } from 'react-router-dom';
import PublicSiteFrame from '../../components/PublicSiteFrame';
import '../../components/PublicSiteFrame.css';

const sections = [
  ['policy-information', 'Information in EduCore', 'EduCore may contain account details and school records such as student profiles, attendance, grades, invoices, and announcements. The school using the system determines which records it enters and who is authorized to access them.'],
  ['policy-use', 'How information is used', 'Information is used to provide the student management features requested by the school, support account access, and maintain the operation of the service. This application does not need student records for advertising or sale to data brokers.'],
  ['policy-access', 'Access and sharing', 'Access is controlled by account role. Students can view their own student workspace; administrators can manage school records according to their assigned access. The school remains the appropriate contact for questions about a specific record or a request to correct it.'],
  ['policy-security', 'Storage and security', 'The service uses authenticated API requests and password verification. A sign-in token is stored in the browser to keep the user signed in. Do not use a shared or public device for an account you need to keep private, and sign out when finished.'],
  ['policy-retention', 'Retention and account requests', 'School records are retained according to the school’s operational and legal requirements. Contact your school administrator to ask about access, correction, retention, or deletion of a student record.'],
  ['policy-contact', 'Questions about this policy', 'For questions about how a school uses EduCore, contact that school’s administrator. For general service questions, use the contact page.'],
];

export default function PrivacyPolicy() {
  return (
    <PublicSiteFrame>
      <main className="info-page">
        <section className="info-hero"><div className="info-hero-inner">
          <p className="info-kicker">PRIVACY &amp; RECORDS</p>
          <h1>Student information deserves careful handling.</h1>
          <p>This page explains, in plain language, what information may be held in EduCore and where to direct questions about school records.</p>
        </div></section>
        <section className="info-section">
          <div className="policy-layout">
            <nav className="policy-nav" aria-label="Privacy policy sections">
              {sections.map(([id, title], index) => <a key={id} href={`#${id}`}>{String(index + 1).padStart(2, '0')} &nbsp; {title}</a>)}
            </nav>
            <article className="policy-article">
              <p className="policy-updated">Last reviewed: September 2026</p>
              {sections.map(([id, title, text], index) => (
                <section id={id} key={id}><p className="info-kicker">SECTION {String(index + 1).padStart(2, '0')}</p><h2>{title}</h2><p>{text}</p></section>
              ))}
              <p>For direct assistance, visit the <Link to="/contact">contact page</Link>.</p>
            </article>
          </div>
        </section>
      </main>
    </PublicSiteFrame>
  );
}
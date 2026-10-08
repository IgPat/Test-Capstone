import { useState } from 'react';
import { ArrowUpRight, Mail } from 'lucide-react';
import PublicSiteFrame from '../../components/PublicSiteFrame';
import '../../components/PublicSiteFrame.css';

const supportEmail = 'support@educore-sms.edu';

export default function ContactUs() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const update = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  const submit = (event) => {
    event.preventDefault();
    const body = `${form.message}\n\nFrom: ${form.name} (${form.email})`;
    window.location.href = `mailto:${supportEmail}?subject=${encodeURIComponent(form.subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <PublicSiteFrame>
      <main className="info-page">
        <section className="info-hero"><div className="info-hero-inner">
          <p className="info-kicker">CONTACT</p>
          <h1>Let’s get you to the right person.</h1>
          <p>For account access, student records, or questions about your school’s EduCore workspace, start with the contact below.</p>
        </div></section>
        <section className="info-section">
          <div className="contact-layout">
            <div>
              <div className="info-section-head"><p className="info-kicker">SUPPORT DESK</p><h2>Talk to the school team.</h2><p>For student-specific records and account changes, contact your school administrator directly.</p></div>
              <div className="contact-details">
                <div className="contact-detail"><span>General support</span><a href={`mailto:${supportEmail}`}>{supportEmail} <ArrowUpRight size={14} /></a></div>
                <div className="contact-detail"><span>Account access</span><p>Ask your school administrator to reset access or verify your student record.</p></div>
                <div className="contact-detail"><span>Response time</span><p>Support requests are handled during school business hours.</p></div>
              </div>
            </div>
            <form className="contact-form" onSubmit={submit}>
              <p className="info-kicker">SEND A MESSAGE</p>
              <label>Your name<input name="name" autoComplete="name" value={form.name} onChange={update} required /></label>
              <label>Email address<input name="email" type="email" autoComplete="email" value={form.email} onChange={update} required /></label>
              <label>Subject<input name="subject" value={form.subject} onChange={update} required /></label>
              <label>How can we help?<textarea name="message" value={form.message} onChange={update} required /></label>
              <button className="info-button" type="submit"><Mail size={16} /> Open email draft</button>
            </form>
          </div>
        </section>
      </main>
    </PublicSiteFrame>
  );
}
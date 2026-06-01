'use client';

import { useState } from 'react';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';

const initial = {
  fullName: '',
  preferredName: '',
  dob: '',
  email: '',
  mobile: '',
  currentLocation: '',
  contactPreference: [],
  voicemailConsent: false,
  appointmentGoals: [],
  primaryConcerns: [],
  presentingSummary: '',
  treatmentGoals: '',
  practiceFit: [],
  openToNonMedication: '',
  interestedInTherapy: '',
  currentTreatment: '',
  functioningImpact: '',
  safetyRecentSi: '',
  safetySelfHarm: '',
  safetyHarmOthers: '',
  safetyHospitalization: '',
  currentCrisis: false,
  currentMedications: '',
  pastTreatment: '',
  medicalConditions: '',
  substanceUse: '',
  adhdInterest: '',
  stimulantRequest: '',
  ketamineInterest: '',
  ketamineRiskFactors: [],
  preferredVisitType: '',
  availability: [],
  paymentType: [],
  insuranceProvider: '',
  legalOrForensicRequest: '',
  additionalContext: '',
  acknowledgment: false,
  website: '',
};

const appointmentGoals = [
  'Psychiatric evaluation',
  'Medication management',
  'Psychotherapy',
  'Combined psychotherapy and medication management',
  'ADHD evaluation or treatment',
  'Anxiety or panic treatment',
  'Depression or mood concerns',
  'Trauma/PTSD-related care',
  'Grief, life transition, or relationship-related concerns',
  'Ketamine-assisted psychotherapy consultation',
  'Second opinion or diagnostic clarification',
];

const concerns = [
  'Excessive worry',
  'Panic attacks',
  'Depression',
  'Low motivation',
  'Mood swings',
  'Irritability or anger',
  'Difficulty concentrating',
  'ADHD or executive functioning concerns',
  'Sleep problems',
  'Trauma-related symptoms',
  'Grief or loss',
  'Relationship stress',
  'Work or school stress',
  'Substance use concerns',
  'Chronic pain or medical stress',
];

const fitItems = [
  'A careful psychiatric evaluation, not just a quick medication visit',
  'A psychiatrist who considers both symptoms and life context',
  'A combination of psychotherapy and medication management when appropriate',
  'Help understanding patterns, relationships, emotions, or past experiences',
  'A collaborative treatment plan',
  'A holistic/integrative approach',
  'A second opinion about diagnosis or medication',
  'A specific medication or controlled substance request',
  'A one-time appointment only',
];

const ketamineRisks = [
  'Bipolar disorder or manic episodes',
  'Psychosis or hallucinations',
  'Uncontrolled high blood pressure',
  'Significant heart condition',
  'Active substance use concern',
  'Seizure disorder',
  'Pregnancy or planning pregnancy',
  'None of the above',
  'Prefer to discuss directly',
];

function toggleArray(values, item) {
  return values.includes(item) ? values.filter((value) => value !== item) : [...values, item];
}

function getSubmitUrl() {
  const explicit = process.env.NEXT_PUBLIC_GOOD_FIT_FUNCTION_URL;
  if (explicit) return explicit;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
  return url ? `${url.replace(/\/$/, '')}/functions/v1/submit-good-fit` : '';
}

function getAnonKey() {
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';
}

function Field({ label, children }) {
  return <div><label className="mb-2 block font-semibold text-slate-800">{label}</label>{children}</div>;
}

function TextInput(props) {
  return <input {...props} className="w-full rounded-2xl border border-slate-300 bg-white p-3 text-slate-950 outline-none transition focus:border-[#2f8c85] focus:ring-4 focus:ring-[#edf8f1]" />;
}

function SelectInput(props) {
  return <select {...props} className="w-full rounded-2xl border border-slate-300 bg-white p-3 text-slate-950 outline-none transition focus:border-[#2f8c85] focus:ring-4 focus:ring-[#edf8f1]" />;
}

function TextArea(props) {
  return <textarea {...props} className="min-h-28 w-full rounded-2xl border border-slate-300 bg-white p-3 text-slate-950 outline-none transition focus:border-[#2f8c85] focus:ring-4 focus:ring-[#edf8f1]" />;
}

function Checkbox({ label, checked, onChange }) {
  return <label className="flex gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm leading-6 text-slate-700"><input className="mt-1 accent-[#173f42]" type="checkbox" checked={checked} onChange={onChange} /> <span>{label}</span></label>;
}

function SectionCard({ number, title, children }) {
  return <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm"><div className="mb-5 flex items-center gap-3"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#173f42] text-sm font-bold text-white">{number}</div><h2 className="text-2xl font-semibold tracking-tight text-slate-950">{title}</h2></div>{children}</section>;
}

function validate(form) {
  if (!form.fullName.trim()) return 'Please enter your full legal name.';
  if (!form.dob) return 'Please enter your date of birth.';
  if (!form.email.trim()) return 'Please enter your email address.';
  if (!form.mobile.trim()) return 'Please enter your mobile phone number.';
  if (!form.currentLocation.trim()) return 'Please confirm whether you are located in Connecticut.';
  if (!form.presentingSummary.trim()) return 'Please briefly describe what led you to seek care now.';
  if (!form.acknowledgment) return 'Please review and accept the acknowledgment before submitting.';
  return '';
}

export default function GoodFitQuestionnaire() {
  const [form, setForm] = useState(initial);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  async function submit(event) {
    event.preventDefault();
    const validationError = validate(form);
    if (validationError) {
      setStatus({ type: 'error', message: validationError });
      return;
    }

    const endpoint = getSubmitUrl();
    const anonKey = getAnonKey();
    if (!endpoint || !anonKey) {
      setStatus({ type: 'error', message: 'The secure questionnaire endpoint is not configured yet. Please contact the office directly.' });
      return;
    }

    setSubmitting(true);
    setStatus({ type: 'loading', message: 'Submitting questionnaire…' });

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: anonKey,
          Authorization: `Bearer ${anonKey}`,
        },
        body: JSON.stringify(form),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || data.ok === false) throw new Error(data.error || 'Unable to submit questionnaire.');
      setStatus({ type: 'success', message: 'Thank you. Your questionnaire was received. The practice will review it and follow up if appropriate.' });
      setForm(initial);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      setStatus({ type: 'error', message: error?.message || 'There was a problem submitting the questionnaire. Please contact the office directly.' });
    } finally {
      setSubmitting(false);
    }
  }

  return <form onSubmit={submit} className="mx-auto max-w-5xl space-y-6">
    {status.message && <div role="status" className={`rounded-[1.5rem] p-5 font-semibold ${status.type === 'error' ? 'border border-rose-200 bg-rose-50 text-rose-900' : 'border border-emerald-200 bg-[#edf8f1] text-[#173f42]'}`}>{status.type === 'success' && <CheckCircle2 className="mr-2 inline h-5 w-5" />}{status.message}</div>}

    <div className="rounded-[1.75rem] border border-amber-200 bg-amber-50 p-5 text-amber-950"><div className="mb-2 flex gap-2 font-semibold"><AlertTriangle className="h-5 w-5" /> Not for emergencies</div>This questionnaire is for non-urgent fit screening only. If you are in immediate danger, having thoughts of suicide, or need urgent help, call 911, go to the nearest emergency room, or call/text 988.</div>

    <input type="text" className="hidden" value={form.website} onChange={(event) => set('website', event.target.value)} tabIndex="-1" autoComplete="off" aria-hidden="true" />

    <SectionCard number="1" title="Basic information">
      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Full legal name *"><TextInput value={form.fullName} onChange={(event) => set('fullName', event.target.value)} required /></Field>
        <Field label="Preferred name"><TextInput value={form.preferredName} onChange={(event) => set('preferredName', event.target.value)} /></Field>
        <Field label="Date of birth *"><TextInput type="date" value={form.dob} onChange={(event) => set('dob', event.target.value)} required /></Field>
        <Field label="Email address *"><TextInput type="email" value={form.email} onChange={(event) => set('email', event.target.value)} required /></Field>
        <Field label="Mobile phone *"><TextInput type="tel" value={form.mobile} onChange={(event) => set('mobile', event.target.value)} required /></Field>
        <Field label="Are you located in Connecticut for care? *"><SelectInput value={form.currentLocation} onChange={(event) => set('currentLocation', event.target.value)} required><option value="">Select one</option><option>Yes, I am in Connecticut</option><option>I will be in Connecticut for telehealth visits</option><option>No</option><option>Unsure</option></SelectInput></Field>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-3">{['Phone call', 'Text message', 'Email'].map((item) => <Checkbox key={item} label={item} checked={form.contactPreference.includes(item)} onChange={() => set('contactPreference', toggleArray(form.contactPreference, item))} />)}</div>
      <div className="mt-3"><Checkbox label="The practice may leave voicemail messages at the number provided." checked={form.voicemailConsent} onChange={() => set('voicemailConsent', !form.voicemailConsent)} /></div>
    </SectionCard>

    <SectionCard number="2" title="What you are looking for">
      <div className="grid gap-3 md:grid-cols-2">{appointmentGoals.map((item) => <Checkbox key={item} label={item} checked={form.appointmentGoals.includes(item)} onChange={() => set('appointmentGoals', toggleArray(form.appointmentGoals, item))} />)}</div>
      <div className="mt-5 grid gap-5"><Field label="Briefly describe what led you to seek care now *"><TextArea value={form.presentingSummary} onChange={(event) => set('presentingSummary', event.target.value)} required /></Field><Field label="What would make treatment feel successful to you?"><TextArea value={form.treatmentGoals} onChange={(event) => set('treatmentGoals', event.target.value)} /></Field></div>
    </SectionCard>

    <SectionCard number="3" title="Symptoms and practice fit">
      <p className="mb-3 leading-7 text-slate-600">Select anything that applies. This helps the practice understand whether the requested care aligns with the services offered.</p>
      <div className="grid gap-3 md:grid-cols-2">{concerns.map((item) => <Checkbox key={item} label={item} checked={form.primaryConcerns.includes(item)} onChange={() => set('primaryConcerns', toggleArray(form.primaryConcerns, item))} />)}</div>
      <h3 className="mt-7 text-lg font-semibold text-slate-950">What are you hoping for?</h3>
      <div className="mt-3 grid gap-3 md:grid-cols-2">{fitItems.map((item) => <Checkbox key={item} label={item} checked={form.practiceFit.includes(item)} onChange={() => set('practiceFit', toggleArray(form.practiceFit, item))} />)}</div>
      <div className="mt-5 grid gap-5 md:grid-cols-3"><Field label="Open to non-medication options?"><SelectInput value={form.openToNonMedication} onChange={(event) => set('openToNonMedication', event.target.value)}><option value="">Select one</option><option>Yes</option><option>No</option><option>Unsure</option></SelectInput></Field><Field label="Interested in psychotherapy?"><SelectInput value={form.interestedInTherapy} onChange={(event) => set('interestedInTherapy', event.target.value)}><option value="">Select one</option><option>Yes</option><option>No</option><option>Maybe</option><option>I already have a therapist</option></SelectInput></Field><Field label="Daily functioning impact"><SelectInput value={form.functioningImpact} onChange={(event) => set('functioningImpact', event.target.value)}><option value="">Select one</option><option>Mild</option><option>Moderate</option><option>Significant</option><option>Severe</option></SelectInput></Field></div>
      <div className="mt-5"><Field label="Current mental health treatment, if any"><TextArea value={form.currentTreatment} onChange={(event) => set('currentTreatment', event.target.value)} /></Field></div>
    </SectionCard>

    <SectionCard number="4" title="Safety screening">
      <div className="grid gap-5 md:grid-cols-2"><Field label="Past month: thoughts of not wanting to be alive?"><SelectInput value={form.safetyRecentSi} onChange={(event) => set('safetyRecentSi', event.target.value)}><option value="">Select one</option><option>No</option><option>Passive thoughts only</option><option>Thoughts of suicide</option><option>Prefer to discuss directly</option></SelectInput></Field><Field label="Thoughts of harming yourself?"><SelectInput value={form.safetySelfHarm} onChange={(event) => set('safetySelfHarm', event.target.value)}><option value="">Select one</option><option>No</option><option>Yes</option><option>Prefer to discuss directly</option></SelectInput></Field><Field label="Thoughts of harming someone else?"><SelectInput value={form.safetyHarmOthers} onChange={(event) => set('safetyHarmOthers', event.target.value)}><option value="">Select one</option><option>No</option><option>Yes</option><option>Prefer to discuss directly</option></SelectInput></Field><Field label="Hospitalization, suicide attempt, or self-harm in past year?"><SelectInput value={form.safetyHospitalization} onChange={(event) => set('safetyHospitalization', event.target.value)}><option value="">Select one</option><option>No</option><option>Yes</option><option>Prefer to discuss directly</option></SelectInput></Field></div>
      <div className="mt-4"><Checkbox label="I am currently in crisis or need urgent help today." checked={form.currentCrisis} onChange={() => set('currentCrisis', !form.currentCrisis)} /></div>
    </SectionCard>

    <SectionCard number="5" title="Treatment history and clinical context">
      <div className="grid gap-5"><Field label="Current psychiatric medications"><TextArea value={form.currentMedications} onChange={(event) => set('currentMedications', event.target.value)} /></Field><Field label="Past treatment or medications"><TextArea value={form.pastTreatment} onChange={(event) => set('pastTreatment', event.target.value)} /></Field><Field label="Medical conditions, allergies, or relevant health concerns"><TextArea value={form.medicalConditions} onChange={(event) => set('medicalConditions', event.target.value)} /></Field><Field label="Alcohol, cannabis, nicotine, or other substance use"><TextArea value={form.substanceUse} onChange={(event) => set('substanceUse', event.target.value)} /></Field></div>
    </SectionCard>

    <SectionCard number="6" title="ADHD, stimulants, and ketamine interests">
      <div className="grid gap-5 md:grid-cols-3"><Field label="ADHD/focus interest"><SelectInput value={form.adhdInterest} onChange={(event) => set('adhdInterest', event.target.value)}><option value="">Select one</option><option>Yes</option><option>No</option><option>Maybe</option></SelectInput></Field><Field label="Specifically seeking stimulant medication?"><SelectInput value={form.stimulantRequest} onChange={(event) => set('stimulantRequest', event.target.value)}><option value="">Select one</option><option>Yes</option><option>No</option><option>Open to discussing options</option><option>Prefer to discuss directly</option></SelectInput></Field><Field label="Ketamine-assisted psychotherapy interest"><SelectInput value={form.ketamineInterest} onChange={(event) => set('ketamineInterest', event.target.value)}><option value="">Select one</option><option>Yes</option><option>No</option><option>Maybe / would like to learn more</option></SelectInput></Field></div>
      <h3 className="mt-6 text-lg font-semibold text-slate-950">Ketamine screening factors, if relevant</h3>
      <div className="mt-3 grid gap-3 md:grid-cols-2">{ketamineRisks.map((item) => <Checkbox key={item} label={item} checked={form.ketamineRiskFactors.includes(item)} onChange={() => set('ketamineRiskFactors', toggleArray(form.ketamineRiskFactors, item))} />)}</div>
    </SectionCard>

    <SectionCard number="7" title="Logistics and payment">
      <div className="grid gap-5 md:grid-cols-2"><Field label="Preferred appointment type"><SelectInput value={form.preferredVisitType} onChange={(event) => set('preferredVisitType', event.target.value)}><option value="">Select one</option><option>Telehealth</option><option>In-person</option><option>Either</option><option>Unsure</option></SelectInput></Field><Field label="Insurance provider, if applicable"><TextInput value={form.insuranceProvider} onChange={(event) => set('insuranceProvider', event.target.value)} /></Field></div>
      <h3 className="mt-6 text-lg font-semibold text-slate-950">Availability</h3><div className="mt-3 grid gap-3 sm:grid-cols-4">{['Weekday mornings', 'Weekday afternoons', 'Weekday evenings', 'First available'].map((item) => <Checkbox key={item} label={item} checked={form.availability.includes(item)} onChange={() => set('availability', toggleArray(form.availability, item))} />)}</div>
      <h3 className="mt-6 text-lg font-semibold text-slate-950">Payment plan</h3><div className="mt-3 grid gap-3 sm:grid-cols-3">{['Insurance through partner platform', 'Private pay', 'Out-of-network reimbursement/superbill', 'Unsure'].map((item) => <Checkbox key={item} label={item} checked={form.paymentType.includes(item)} onChange={() => set('paymentType', toggleArray(form.paymentType, item))} />)}</div>
    </SectionCard>

    <SectionCard number="8" title="Additional fit questions and acknowledgment">
      <div className="grid gap-5"><Field label="Are you seeking legal, disability, custody, forensic, court-related documentation, testimony, or evaluation?"><TextArea value={form.legalOrForensicRequest} onChange={(event) => set('legalOrForensicRequest', event.target.value)} /></Field><Field label="Anything else important for the practice to know?"><TextArea value={form.additionalContext} onChange={(event) => set('additionalContext', event.target.value)} /></Field></div>
      <div className="mt-5"><Checkbox label="I understand this questionnaire is for non-urgent fit screening only, does not establish a doctor-patient relationship, and medication decisions require a full clinical evaluation. If this is an emergency, I should call 911, go to the nearest emergency room, or call/text 988." checked={form.acknowledgment} onChange={() => set('acknowledgment', !form.acknowledgment)} /></div>
    </SectionCard>

    <button disabled={submitting} className="w-full rounded-2xl bg-[#173f42] px-6 py-4 text-base font-bold text-white transition hover:bg-[#24565a] disabled:cursor-not-allowed disabled:opacity-60">{submitting ? 'Submitting…' : 'Submit Good-Fit Questionnaire'}</button>
  </form>;
}

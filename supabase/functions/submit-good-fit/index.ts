import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.48.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': Deno.env.get('CONTACT_ALLOWED_ORIGIN') || '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function json(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function str(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function bool(value: unknown) {
  return value === true;
}

function arr(value: unknown) {
  return Array.isArray(value) ? value.map((item) => String(item).trim()).filter(Boolean) : [];
}

function requireEnv(name: string) {
  const value = Deno.env.get(name);
  if (!value) throw new Error(`Missing ${name}`);
  return value;
}

function textBlock(label: string, value: unknown) {
  const display = Array.isArray(value) ? value.join(', ') : typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value || 'Not provided');
  return `${label}: ${display}`;
}

function buildEmailBody(payload: Record<string, unknown>, id: string) {
  const lines = [
    'New Good-Fit Questionnaire — PHI',
    '',
    textBlock('Submission ID', id),
    textBlock('Submitted', new Date().toISOString()),
    '',
    'BASIC INFORMATION',
    textBlock('Full legal name', payload.fullName),
    textBlock('Preferred name', payload.preferredName),
    textBlock('Date of birth', payload.dob),
    textBlock('Email', payload.email),
    textBlock('Mobile', payload.mobile),
    textBlock('Current location', payload.currentLocation),
    textBlock('Contact preference', payload.contactPreference),
    textBlock('Voicemail consent', payload.voicemailConsent),
    '',
    'WHAT THEY ARE LOOKING FOR',
    textBlock('Appointment goals', payload.appointmentGoals),
    textBlock('Presenting summary', payload.presentingSummary),
    textBlock('Treatment goals', payload.treatmentGoals),
    '',
    'SYMPTOMS AND FIT',
    textBlock('Primary concerns', payload.primaryConcerns),
    textBlock('Practice fit', payload.practiceFit),
    textBlock('Open to non-medication options', payload.openToNonMedication),
    textBlock('Interested in therapy', payload.interestedInTherapy),
    textBlock('Current treatment', payload.currentTreatment),
    textBlock('Functioning impact', payload.functioningImpact),
    '',
    'SAFETY SCREENING',
    textBlock('Recent thoughts of not wanting to be alive', payload.safetyRecentSi),
    textBlock('Thoughts of self-harm', payload.safetySelfHarm),
    textBlock('Thoughts of harming others', payload.safetyHarmOthers),
    textBlock('Hospitalization/self-harm/attempt in past year', payload.safetyHospitalization),
    textBlock('Currently in crisis', payload.currentCrisis),
    '',
    'TREATMENT HISTORY AND CONTEXT',
    textBlock('Current medications', payload.currentMedications),
    textBlock('Past treatment', payload.pastTreatment),
    textBlock('Medical conditions', payload.medicalConditions),
    textBlock('Substance use', payload.substanceUse),
    '',
    'ADHD / STIMULANT / KETAMINE',
    textBlock('ADHD interest', payload.adhdInterest),
    textBlock('Stimulant request', payload.stimulantRequest),
    textBlock('Ketamine interest', payload.ketamineInterest),
    textBlock('Ketamine risk factors', payload.ketamineRiskFactors),
    '',
    'LOGISTICS AND PAYMENT',
    textBlock('Preferred visit type', payload.preferredVisitType),
    textBlock('Availability', payload.availability),
    textBlock('Payment type', payload.paymentType),
    textBlock('Insurance provider', payload.insuranceProvider),
    '',
    'ADDITIONAL FIT QUESTIONS',
    textBlock('Legal/forensic request', payload.legalOrForensicRequest),
    textBlock('Additional context', payload.additionalContext),
    textBlock('Acknowledgment', payload.acknowledgment),
  ];
  return lines.join('\n');
}

async function sendEmail(subject: string, body: string, replyTo?: string) {
  const provider = (Deno.env.get('EMAIL_PROVIDER') || 'resend').toLowerCase();
  const to = requireEnv('CONTACT_EMAIL_TO');
  const from = requireEnv('CONTACT_EMAIL_FROM');

  if (provider === 'resend') {
    const apiKey = requireEnv('RESEND_API_KEY');
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, to, subject, text: body, reply_to: replyTo || undefined }),
    });
    if (!response.ok) throw new Error('Email provider failed');
    return;
  }

  if (provider === 'postmark') {
    const token = requireEnv('POSTMARK_SERVER_TOKEN');
    const response = await fetch('https://api.postmarkapp.com/email', {
      method: 'POST',
      headers: { 'X-Postmark-Server-Token': token, 'Content-Type': 'application/json' },
      body: JSON.stringify({ From: from, To: to, Subject: subject, TextBody: body, ReplyTo: replyTo || undefined }),
    });
    if (!response.ok) throw new Error('Email provider failed');
    return;
  }

  if (provider === 'sendgrid') {
    const apiKey = requireEnv('SENDGRID_API_KEY');
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: to }] }],
        from: { email: from },
        reply_to: replyTo ? { email: replyTo } : undefined,
        subject,
        content: [{ type: 'text/plain', value: body }],
      }),
    });
    if (!response.ok) throw new Error('Email provider failed');
    return;
  }

  throw new Error('Unsupported email provider');
}

function validate(payload: Record<string, unknown>) {
  if (str(payload.website)) return 'spam';
  if (!str(payload.fullName)) return 'Full name is required.';
  if (!str(payload.email) || !str(payload.email).includes('@')) return 'Valid email is required.';
  if (!str(payload.mobile)) return 'Mobile phone is required.';
  if (!str(payload.dob)) return 'Date of birth is required.';
  if (!str(payload.currentLocation)) return 'Current location is required.';
  if (!str(payload.presentingSummary)) return 'Presenting summary is required.';
  if (!bool(payload.acknowledgment)) return 'Acknowledgment is required.';
  return '';
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ ok: false, error: 'Method not allowed' }, 405);

  try {
    const payload = await req.json();
    const validationError = validate(payload);
    if (validationError === 'spam') return json({ ok: true });
    if (validationError) return json({ ok: false, error: validationError }, 400);

    const supabase = createClient(requireEnv('SUPABASE_URL'), requireEnv('SUPABASE_SERVICE_ROLE_KEY'), {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const email = str(payload.email).toLowerCase();
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count } = await supabase
      .from('good_fit_questionnaires')
      .select('id', { count: 'exact', head: true })
      .eq('email', email)
      .gte('created_at', oneHourAgo);

    const maxPerHour = Number(Deno.env.get('CONTACT_RATE_LIMIT_PER_HOUR') || '3');
    if ((count || 0) >= maxPerHour) return json({ ok: false, error: 'Too many submissions. Please try again later.' }, 429);

    const row = {
      full_name: str(payload.fullName),
      preferred_name: str(payload.preferredName),
      dob: str(payload.dob) || null,
      email,
      mobile: str(payload.mobile),
      current_location: str(payload.currentLocation),
      contact_preference: arr(payload.contactPreference),
      voicemail_consent: bool(payload.voicemailConsent),
      appointment_goals: arr(payload.appointmentGoals),
      primary_concerns: arr(payload.primaryConcerns),
      presenting_summary: str(payload.presentingSummary),
      treatment_goals: str(payload.treatmentGoals),
      practice_fit: arr(payload.practiceFit),
      open_to_non_medication: str(payload.openToNonMedication) === 'Yes' ? true : str(payload.openToNonMedication) === 'No' ? false : null,
      interested_in_therapy: str(payload.interestedInTherapy),
      current_treatment: str(payload.currentTreatment),
      functioning_impact: str(payload.functioningImpact),
      safety_recent_si: str(payload.safetyRecentSi),
      safety_self_harm: str(payload.safetySelfHarm),
      safety_harm_others: str(payload.safetyHarmOthers),
      safety_hospitalization: str(payload.safetyHospitalization),
      current_crisis: bool(payload.currentCrisis),
      current_medications: str(payload.currentMedications),
      past_treatment: str(payload.pastTreatment),
      medical_conditions: str(payload.medicalConditions),
      substance_use: str(payload.substanceUse),
      adhd_interest: str(payload.adhdInterest),
      stimulant_request: str(payload.stimulantRequest),
      ketamine_interest: str(payload.ketamineInterest),
      ketamine_risk_factors: arr(payload.ketamineRiskFactors),
      preferred_visit_type: str(payload.preferredVisitType),
      availability: arr(payload.availability),
      payment_type: arr(payload.paymentType),
      insurance_provider: str(payload.insuranceProvider),
      legal_or_forensic_request: str(payload.legalOrForensicRequest),
      additional_context: str(payload.additionalContext),
      acknowledgment: bool(payload.acknowledgment),
    };

    const { data, error } = await supabase.from('good_fit_questionnaires').insert(row).select('id').single();
    if (error) return json({ ok: false, error: 'Could not save questionnaire.' }, 500);

    try {
      await sendEmail('New Good-Fit Questionnaire — PHI', buildEmailBody(payload, data.id), email);
    } catch (_emailError) {
      await supabase.from('audit_log').insert({
        action: 'good_fit_email_failed',
        resource_type: 'good_fit_questionnaires',
        resource_id: data.id,
        metadata: { reason: 'email_delivery_failed' },
      });
    }

    return json({ ok: true, id: data.id });
  } catch (_error) {
    return json({ ok: false, error: 'Unexpected submission error.' }, 500);
  }
});

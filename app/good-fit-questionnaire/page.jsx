import GoodFitQuestionnaire from '../../components/GoodFitQuestionnaire';
import { PageHero, Section } from '../../components/ui';

export const metadata = {
  title: 'Good-Fit Questionnaire | Integrative Psychiatry',
  description: 'A non-urgent questionnaire to help determine whether Integrative Psychiatry may be a good fit for your care needs.',
};

export default function GoodFitQuestionnairePage() {
  return <>
    <PageHero
      eyebrow="New Patient Screening"
      title="Good-Fit Questionnaire"
      subtitle="This non-urgent questionnaire helps the practice understand what you are looking for, whether the practice may be a good fit, and whether another type or level of care may be more appropriate."
    />
    <Section className="bg-slate-50">
      <GoodFitQuestionnaire />
    </Section>
  </>;
}

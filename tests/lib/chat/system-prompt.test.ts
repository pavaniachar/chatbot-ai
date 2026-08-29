import { describe, expect, it } from 'vitest';
import { SYSTEM_PROMPT } from '@/lib/chat/system-prompt';

describe('SYSTEM_PROMPT', () => {
  it('includes real contact details', () => {
    expect(SYSTEM_PROMPT).toContain('hello@gocadre.ai');
    expect(SYSTEM_PROMPT).toContain('(619) 324-3223');
    expect(SYSTEM_PROMPT).toContain('cadreai.com/contact');
  });

  it('includes the AI Maturity Index eight-pillar framework', () => {
    expect(SYSTEM_PROMPT).toContain('eight-pillar');
    expect(SYSTEM_PROMPT).toContain('AI Maturity Index');
  });

  it('names the real client portal', () => {
    expect(SYSTEM_PROMPT).toContain('AI Results Dashboard');
  });

  it('describes the 45-Day AI Transformation Intensive phases', () => {
    expect(SYSTEM_PROMPT).toContain('45-Day');
  });

  it('states the model-selection framework places customer service in the Sonnet tier', () => {
    expect(SYSTEM_PROMPT).toContain('Claude Sonnet');
    expect(SYSTEM_PROMPT).toContain('Claude Haiku');
    expect(SYSTEM_PROMPT).toContain('Claude Opus');
  });

  it('states the published data-handling facts', () => {
    expect(SYSTEM_PROMPT).toContain('never used to train other models');
    expect(SYSTEM_PROMPT).toContain('2 years');
  });

  it('does not claim any compliance certification', () => {
    expect(SYSTEM_PROMPT.toLowerCase()).not.toContain('soc 2 certified');
    expect(SYSTEM_PROMPT.toLowerCase()).not.toContain('gdpr compliant');
    expect(SYSTEM_PROMPT.toLowerCase()).not.toContain('is certified');
  });

  it('instructs against inventing pricing', () => {
    expect(SYSTEM_PROMPT).toContain('Never invent a number');
  });

  it('includes the scope guard and escalation instructions', () => {
    expect(SYSTEM_PROMPT.toLowerCase()).toContain('cadre ai questions');
    expect(SYSTEM_PROMPT).toContain('Talk to an AI Strategist');
  });

  it('lists all nine served industries', () => {
    [
      'professional services',
      'private equity',
      'real estate',
      'financial services',
      'mortgage & lending',
      'construction',
      'retail & e-commerce',
      'manufacturing & logistics',
      'hospitality',
    ].forEach((industry) => {
      expect(SYSTEM_PROMPT.toLowerCase()).toContain(industry);
    });
  });

  it('states the industry count so the model never has to infer it', () => {
    // Regression: the model previously answered "eight core industries" and
    // then listed nine, anchoring on the "eight-pillar framework" phrase in
    // the adjacent AI Maturity Index section. The count is now stated.
    const industriesSection = SYSTEM_PROMPT.slice(
      SYSTEM_PROMPT.indexOf('## Industries served'),
      SYSTEM_PROMPT.indexOf('## The AI Maturity Index'),
    );
    expect(industriesSection.toLowerCase()).toContain('nine');
    expect(industriesSection.toLowerCase()).not.toContain('eight');
  });
});

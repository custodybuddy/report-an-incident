import { type BehaviorType, type JurisdictionInfo, type StatuteRef } from '@/types/legal';
import {
  JURISDICTIONS,
  getJurisdictionMetadata,
  normalizeJurisdiction,
  type JurisdictionMetadata,
} from '@/legal/jurisdictions';

export const SITE_LINKS = {
  home: 'https://custodybuddy.com/',
  contact: 'https://custodybuddy.com/contact/',
  privacy: 'https://custodybuddy.com/incident-report/privacy-policy/',
  terms: 'https://custodybuddy.com/incident-report/terms-of-use/',
  disclaimer: 'https://custodybuddy.com/incident-report/legal-disclaimer/',
};

// --------------------------------------
// CANADA — Federal Statutes (concise map)
// --------------------------------------
export const CANADA_FEDERAL = {
  divorceAct: {
    definitionFamilyViolence: 'https://laws-lois.justice.gc.ca/eng/acts/d-3.4/page-1.html#h-1172378', // s.2(1)
    bestInterests: 'https://laws-lois.justice.gc.ca/eng/acts/d-3.4/page-3.html#h-1172571', // s.16(4)
  },
  criminalCode: {
    intimidation: 'https://laws-lois.justice.gc.ca/eng/acts/c-46/section-423.html',
    harassment: 'https://laws-lois.justice.gc.ca/eng/acts/c-46/section-264.html',
    threats: 'https://laws-lois.justice.gc.ca/eng/acts/c-46/section-264.1.html',
  },
};

export const CANADA_FEDERAL_STATUTES = {
  divorceAct: {
    base: 'https://laws-lois.justice.gc.ca/eng/acts/d-3.4/',
    bestInterests: 'https://laws-lois.justice.gc.ca/eng/acts/d-3.4/page-3.html#h-1172510', // s. 16 — Best Interests Test
    familyViolence: 'https://laws-lois.justice.gc.ca/eng/acts/d-3.4/page-3.html#h-1172571', // s. 16(4) factors
    familyViolenceCoerciveControl: 'https://laws-lois.justice.gc.ca/eng/acts/d-3.4/page-1.html#h-1172378', // s. 2(1) definition includes coercive control
    familyViolenceDef: 'https://laws-lois.justice.gc.ca/eng/acts/d-3.4/page-1.html#h-1172378', // s. 2(1) — Family Violence Definition
    relocation: 'https://laws-lois.justice.gc.ca/eng/acts/d-3.4/page-4.html#h-1172637', // s. 16.8–16.96 — Relocation
  },
  criminalCode: {
    harassment: 'https://laws-lois.justice.gc.ca/eng/acts/c-46/section-264.html', // Criminal Harassment
    intimidation: 'https://laws-lois.justice.gc.ca/eng/acts/c-46/section-423.html', // Intimidation
    coerciveControlRelated: 'https://laws-lois.justice.gc.ca/eng/acts/c-46/section-264.1.html', // Threats
  },
};

export const CANADA_PROVINCIAL_ACTS: Record<string, { familyLawAct?: string; bestInterests?: string; [key: string]: string | undefined }> =
  {
    ontario: {
      familyLawAct: 'https://www.ontario.ca/laws/statute/90f03',
      childrenLawReformAct: 'https://www.ontario.ca/laws/statute/90c12',
      bestInterests: 'https://www.ontario.ca/laws/statute/90c12#BK9', // CLRA s. 24
    },
    'british columbia': {
      familyLawAct: 'https://www.bclaws.gov.bc.ca/civix/document/id/complete/statreg/11025_01',
      bestInterests: 'https://www.bclaws.gov.bc.ca/civix/document/id/complete/statreg/11025_03#section37', // s. 37
    },
    alberta: {
      familyLawAct: 'https://kings-printer.alberta.ca/documents/Acts/F04P5.pdf',
    },
    saskatchewan: {
      childrenSFamily: 'https://publications.saskatchewan.ca/#/products/10048',
    },
    manitoba: {
      familyMaintenanceAct: 'https://web2.gov.mb.ca/laws/statutes/ccsm/f020e.php',
    },
    quebec: {
      civilCode: 'https://ccq.lexum.com/ccq/en',
    },
    'nova scotia': {
      parentingAct: 'https://nslegislature.ca/sites/default/files/legc/statutes/parenting.pdf',
    },
    'new brunswick': {
      familyServicesAct: 'https://laws.gnb.ca/en/showfulldoc/cs/F-2.2',
    },
    'prince edward island': {
      familyLawAct: 'https://www.princeedwardisland.ca/en/legislation/shares/family-law-act',
    },
    'newfoundland and labrador': {
      familyLawAct: 'https://www.assembly.nl.ca/legislation/sr/statutes/f02.htm',
    },
    yukon: {
      childrenAct: 'https://laws.yukon.ca/cms/images/LEGISLATION/PRINCIPAL/2002/2002-006/2002-006.pdf',
    },
    'northwest territories': {
      childYouthFamilyEnhancement:
        'https://www.justice.gov.nt.ca/en/files/legislation/child-and-family-services/child-and-family-services.a.pdf',
    },
    nunavut: {
      familyLawAct: 'https://www.nunavutlegislation.ca/en/legislation/family-law-act',
    },
  };

export const US_FEDERAL_REFERENCES = {
  uccjeaSummary: 'https://www.uniformlaws.org/acts/uccjea',
  childWelfarePolicy: 'https://www.childwelfare.gov/topics/systemwide/laws-policies/',
};

export const US_FEDERAL = {
  uccjea: {
    label: 'UCCJEA Summary',
    link: 'https://www.uniformlaws.org/acts/uccjea',
  },
  childWelfare: {
    label: 'Child Welfare Laws & Policies',
    link: 'https://www.childwelfare.gov/topics/systemwide/laws-policies/',
  },
};

export const US_COERCIVE_CONTROL: Record<string, StatuteRef[]> = {
  california: [
    {
      label: 'California Family Code §6320 — Coercive Control',
      link: 'https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?sectionNum=6320.&lawCode=FAM',
    },
  ],
  connecticut: [
    {
      label: 'Connecticut Coercive Control Law (2021)',
      link: 'https://www.cga.ct.gov/current/pub/chap_815e.htm#sec_46b-1',
    },
  ],
  hawaii: [
    {
      label: 'Hawaii HRS §586-1 — Coercive Control',
      link: 'https://www.capitol.hawaii.gov/hrscurrent/Vol12_Ch0501-0588/HRS0586/HRS_0586-0001.htm',
    },
  ],
  washington: [
    {
      label: 'Washington RCW 7.105.010 — Coercive Control',
      link: 'https://app.leg.wa.gov/rcw/default.aspx?cite=7.105.010',
    },
  ],
  colorado: [
    { label: 'Colorado HB24-1088 — Coercive Control', link: 'https://leg.colorado.gov/bills/hb24-1088' },
  ],
};

// --------------------------------------
// CANADA — Provincial/Territorial Acts (statute refs)
// --------------------------------------
export const CANADA_PROVINCES: Record<string, StatuteRef[]> = {
  ontario: [
    { label: "Children's Law Reform Act — s.24 (Best Interests)", link: 'https://www.ontario.ca/laws/statute/90c12#BK9' },
    { label: 'Family Law Act', link: 'https://www.ontario.ca/laws/statute/90f03' },
  ],
  britishcolumbia: [
    { label: 'Family Law Act', link: 'https://www.bclaws.gov.bc.ca/civix/document/id/complete/statreg/11025_01' },
    { label: 'Best Interests — s.37', link: 'https://www.bclaws.gov.bc.ca/civix/document/id/complete/statreg/11025_03#section37' },
  ],
  alberta: [{ label: 'Family Law Act', link: 'https://kings-printer.alberta.ca/documents/Acts/F04P5.pdf' }],
  saskatchewan: [{ label: "Children's Law Act, 2020", link: 'https://publications.saskatchewan.ca/#/products/10048' }],
  manitoba: [{ label: 'Family Maintenance Act', link: 'https://web2.gov.mb.ca/laws/statutes/ccsm/f020e.php' }],
  quebec: [{ label: 'Civil Code of Quebec — Custody Articles', link: 'https://ccq.lexum.com/ccq/en' }],
  novascotia: [{ label: 'Parenting and Support Act', link: 'https://nslegislature.ca/sites/default/files/legc/statutes/parenting.pdf' }],
  newbrunswick: [{ label: 'Family Services Act', link: 'https://laws.gnb.ca/en/showfulldoc/cs/F-2.2' }],
  newfoundlandandlabrador: [{ label: 'Family Law Act', link: 'https://www.assembly.nl.ca/legislation/sr/statutes/f02.htm' }],
  princeedwardisland: [{ label: 'Family Law Act', link: 'https://www.princeedwardisland.ca/en/legislation/shares/family-law-act' }],
  yukon: [{ label: "Children's Act", link: 'https://laws.yukon.ca/cms/images/LEGISLATION/PRINCIPAL/2002/2002-006/2002-006.pdf' }],
  northwestterritories: [
    { label: 'Child & Family Services Act', link: 'https://www.justice.gov.nt.ca/en/files/legislation/child-and-family-services/child-and-family-services.a.pdf' },
  ],
  nunavut: [{ label: 'Family Law Act', link: 'https://www.nunavutlegislation.ca/en/legislation/family-law-act' }],
};

export const US_STATE_FAMILY_CODES: Record<string, { familyCode?: string; bestInterests?: string; [key: string]: string | undefined }> = {
  california: {
    familyCode: 'https://leginfo.legislature.ca.gov/faces/codes.xhtml',
    bestInterests: 'https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?sectionNum=3011.&lawCode=FAM',
  },
  texas: {
    familyCode: 'https://statutes.capitol.texas.gov/?link=FA',
  },
  'new york': {
    domesticRelations: 'https://www.nysenate.gov/legislation/laws/DOM',
    familyCourtAct: 'https://www.nysenate.gov/legislation/laws/FCT',
  },
  florida: {
    statutes: 'https://www.leg.state.fl.us/statutes/',
  },
};

export const US_COERCIVE_CONTROL_LAWS: Record<string, { coerciveControl: string }> = {
  california: {
    coerciveControl: 'https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?sectionNum=6320.&lawCode=FAM', // Family Code §6320
  },
  connecticut: {
    coerciveControl: 'https://www.cga.ct.gov/current/pub/chap_815e.htm#sec_46b-1', // Expanded definition 2021
  },
  hawaii: {
    coerciveControl: 'https://www.capitol.hawaii.gov/hrscurrent/Vol12_Ch0501-0588/HRS0586/HRS_0586-0001.htm', // HRS §586-1
  },
  washington: {
    coerciveControl: 'https://app.leg.wa.gov/rcw/default.aspx?cite=7.105.010', // RCW 7.105.010
  },
  colorado: {
    coerciveControl: 'https://leg.colorado.gov/bills/hb24-1088', // 2024 coercive control bill
  },
};

export const COERCIVE_CONTROL_GLOSSARY: Record<
  BehaviorType,
  { label: string; examples: string[]; canadaStatute?: string }
> = {
  isolation: {
    label: 'Isolation',
    examples: ['limiting contact with family/friends', 'controlling transportation', 'monitoring movements'],
    canadaStatute: CANADA_FEDERAL_STATUTES.divorceAct.familyViolenceCoerciveControl,
  },
  intimidation: {
    label: 'Intimidation',
    examples: ['threats of harm', 'destroying property', 'stalking behaviours'],
    canadaStatute: CANADA_FEDERAL_STATUTES.criminalCode.intimidation,
  },
  surveillance: {
    label: 'Surveillance / Monitoring',
    examples: ['phone monitoring', 'location tracking', 'pressuring child for information'],
    canadaStatute: CANADA_FEDERAL_STATUTES.divorceAct.familyViolenceCoerciveControl,
  },
  economicAbuse: {
    label: 'Economic Abuse',
    examples: ['withholding money', 'restricting spending', 'sabotaging employment'],
    canadaStatute: CANADA_FEDERAL_STATUTES.divorceAct.familyViolenceCoerciveControl,
  },
  threats: {
    label: 'Threats & Psychological Harm',
    examples: ['“you’ll lose the kids” threats', 'legal bullying', 'litigation harassment'],
    canadaStatute: CANADA_FEDERAL_STATUTES.criminalCode.coerciveControlRelated,
  },
  litigationAbuse: {
    label: 'Litigation Abuse',
    examples: ['repeated filings to harass', 'threats of court to intimidate'],
    canadaStatute: CANADA_FEDERAL_STATUTES.criminalCode.intimidation,
  },
  manipulation: {
    label: 'Manipulation',
    examples: ['gaslighting', 'coercing compliance'],
    canadaStatute: CANADA_FEDERAL_STATUTES.divorceAct.familyViolenceCoerciveControl,
  },
  propertyDamage: {
    label: 'Property Damage',
    examples: ['destroying devices', 'damaging car'],
    canadaStatute: CANADA_FEDERAL_STATUTES.criminalCode.intimidation,
  },
};

export const RESOURCE_LINKS = {
  canadaParentingPlanGuide: 'https://www.ontario.ca/page/parenting-plan-guide',
  canadaLegalAid: 'https://www.justice.gc.ca/eng/fund-fina/legal-aid-aide-juridique.html',
  usLegalAid: 'https://www.usa.gov/legal-aid',
  usChildWelfare: 'https://www.childwelfare.gov/topics/systemwide/laws-policies/',
};

const DEFAULT_JURISDICTION: JurisdictionMetadata =
  JURISDICTIONS.find((j) => j.id === 'ontario') ?? JURISDICTIONS[0];

export const resolveJurisdiction = (rawJurisdiction?: string): JurisdictionInfo => {
  if (!rawJurisdiction) {
    return {
      country: DEFAULT_JURISDICTION.country,
      region: DEFAULT_JURISDICTION.region,
      id: DEFAULT_JURISDICTION.id,
    };
  }

  const normalized = normalizeJurisdiction(rawJurisdiction);
  const found = getJurisdictionMetadata(normalized) ?? DEFAULT_JURISDICTION;

  return {
    country: found.country,
    region: found.region,
    id: found.id,
  };
};

export const behaviorToBadges: Record<BehaviorType, string[]> = {
  isolation: ['Family Violence', 'Coercive Control'],
  intimidation: ['Family Violence', 'Threats'],
  surveillance: ['Monitoring', 'Privacy'],
  economicAbuse: ['Financial Control'],
  threats: ['Threats', 'Safety'],
  litigationAbuse: ['Litigation Abuse'],
  manipulation: ['Coercive Control'],
  propertyDamage: ['Property Damage'],
};

export const mapAllegationToStatutes = (behaviorType: string, jurisdiction: JurisdictionInfo): StatuteRef[] => {
  const glossaryEntry = COERCIVE_CONTROL_GLOSSARY[behaviorType as BehaviorType];
  const baseStatutes = getStatutesForJurisdiction(jurisdiction, behaviorType);
  const statutes: StatuteRef[] = [...baseStatutes];

  // Preserve behaviour-specific Criminal Code link if provided
  if (jurisdiction.country === 'CA' && glossaryEntry?.canadaStatute) {
    const alreadyPresent = statutes.some((s) => s.link === glossaryEntry.canadaStatute);
    if (!alreadyPresent) {
      statutes.push({
        label: 'Criminal Code',
        link: glossaryEntry.canadaStatute,
      });
    }
  }

  // If using legacy state mapping, ensure we still include the explicit coercive-control law label
  if (jurisdiction.country === 'US') {
    const stateLegacy = US_COERCIVE_CONTROL_LAWS[jurisdiction.id];
    if (stateLegacy) {
      const alreadyPresent = statutes.some((s) => s.link === stateLegacy.coerciveControl);
      if (!alreadyPresent) {
        statutes.push({
          label: `${jurisdiction.region} Coercive Control Law`,
          link: stateLegacy.coerciveControl,
        });
      }
    }
  }

  return statutes;
};

// Universal statute fetcher utility
export const getStatutesForJurisdiction = (j: JurisdictionInfo, behaviorType?: BehaviorType): StatuteRef[] => {
  const statutes: StatuteRef[] = [];

  if (j.country === 'CA') {
    statutes.push(
      { label: 'Divorce Act — Family Violence (s.2(1))', link: CANADA_FEDERAL.divorceAct.definitionFamilyViolence },
      { label: 'Divorce Act — Best Interests (s.16(4))', link: CANADA_FEDERAL.divorceAct.bestInterests }
    );

    const provincial = CANADA_PROVINCES[normalizeJurisdiction(j.id).replace(/[^a-z]/g, '')];
    if (provincial) statutes.push(...provincial);

    statutes.push({
      label: 'Criminal Code — Intimidation (s.423)',
      link: CANADA_FEDERAL.criminalCode.intimidation,
    });
  }

  if (j.country === 'US') {
    statutes.push(US_FEDERAL.uccjea, US_FEDERAL.childWelfare);
    const state = US_COERCIVE_CONTROL[normalizeJurisdiction(j.id)];
    if (state) statutes.push(...state);
  }

  return statutes;
};

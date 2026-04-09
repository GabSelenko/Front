import bradescoLogo from '../assets/logos/bradesco-saude.png'
import unimedLogo from '../assets/logos/unimed.png'
import sulamericaLogo from '../assets/logos/sulamerica.png'
import medseniorLogo from '../assets/logos/medsenior.png'
import nossaSaudeLogo from '../assets/logos/nossa-saude.png'
import selectLogo from '../assets/logos/select.png'
import clinipamLogo from '../assets/logos/clinipam.png'

// [colorFrom, colorTo] — used to tint the operator card header
const OPERATOR_LOGO_MAP = [
  {
    keywords: ['unimed'],
    logo: unimedLogo,
    colors: ['#1a6b3a', '#3aac6e'],
  },
  {
    keywords: ['medsenior', 'medsênior', 'med senior', 'med sênior'],
    logo: medseniorLogo,
    colors: ['#0d4a1f', '#1e8c3a'],
  },
  {
    keywords: ['nossa saude', 'nossa saúde', 'nossasaude', 'nossa'],
    logo: nossaSaudeLogo,
    colors: ['#7c2d00', '#c2570a'],
  },
  {
    keywords: ['select saude', 'select saúde', 'select'],
    logo: selectLogo,
    colors: ['#3b0764', '#6d28d9'],
  },
  {
    keywords: ['clinipam'],
    logo: clinipamLogo,
    colors: ['#b91c1c', '#ea580c'],
  },
  {
    keywords: ['amil'],
    logo: 'https://logo.clearbit.com/amil.com.br',
    colors: ['#00256e', '#0047cc'],
  },
  {
    keywords: ['bradesco', 'bradesco saúde', 'bradesco saude'],
    logo: bradescoLogo,
    colors: ['#8b0000', '#cc0000'],
  },
  {
    keywords: ['sulamerica', 'sulamérica', 'sul america', 'sul américa'],
    logo: sulamericaLogo,
    colors: ['#00235a', '#0050a0'],
  },
  {
    keywords: ['hapvida'],
    logo: 'https://logo.clearbit.com/hapvida.com.br',
    colors: ['#003d7a', '#0074cc'],
  },
  {
    keywords: ['notredame', 'notre dame', 'intermedica', 'intermédica', 'gndi'],
    logo: 'https://logo.clearbit.com/gndi.com.br',
    colors: ['#00235a', '#0050a0'],
  },
  {
    keywords: ['porto seguro'],
    logo: 'https://logo.clearbit.com/portoseguro.com.br',
    colors: ['#002244', '#004080'],
  },
  {
    keywords: ['prevent senior', 'prevent'],
    logo: 'https://logo.clearbit.com/preventsenior.com.br',
    colors: ['#003d7a', '#0066b3'],
  },
  {
    keywords: ['golden cross', 'goldencross'],
    logo: 'https://logo.clearbit.com/goldencross.com.br',
    colors: ['#7a4000', '#c26a00'],
  },
  {
    keywords: ['omint'],
    logo: 'https://logo.clearbit.com/omint.com.br',
    colors: ['#1a1a6e', '#3333cc'],
  },
  {
    keywords: ['assim', 'assim saúde', 'assim saude'],
    logo: 'https://logo.clearbit.com/assimvida.com.br',
    colors: ['#005c3d', '#009966'],
  },
  {
    keywords: ['cassi'],
    logo: 'https://logo.clearbit.com/cassi.com.br',
    colors: ['#003d7a', '#0066cc'],
  },
  {
    keywords: ['care plus', 'careplus'],
    logo: 'https://logo.clearbit.com/careplus.com.br',
    colors: ['#004080', '#0066cc'],
  },
  {
    keywords: ['allianz'],
    logo: 'https://logo.clearbit.com/allianz.com.br',
    colors: ['#003781', '#006bb6'],
  },
  {
    keywords: ['metlife'],
    logo: 'https://logo.clearbit.com/metlife.com.br',
    colors: ['#003087', '#0050cc'],
  },
  {
    keywords: ['itau', 'itaú'],
    logo: 'https://logo.clearbit.com/itau.com.br',
    colors: ['#7a3500', '#ec7000'],
  },
  {
    keywords: ['caixa'],
    logo: 'https://logo.clearbit.com/caixa.gov.br',
    colors: ['#003d00', '#006600'],
  },
]

function findEntry(operatorName) {
  if (!operatorName || typeof operatorName !== 'string') return null
  const lower = operatorName.toLowerCase()
  return OPERATOR_LOGO_MAP.find(e => e.keywords.some(k => lower.includes(k))) ?? null
}

export function getOperatorLogo(operatorName) {
  return findEntry(operatorName)?.logo ?? null
}

export function getOperatorColors(operatorName) {
  return findEntry(operatorName)?.colors ?? null
}

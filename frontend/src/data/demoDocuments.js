/**
 * ReguLens Demo & Library Documents Data
 * Real regulatory documents from RBI and sample internal policies for compliance gap analysis.
 */

export const DEMO_PREVIOUS_DOC = {
  id: 'rbi_psl_2020_official',
  title: 'rbi_psl_2020_official.pdf',
  name: 'Reserve Bank of India (Priority Sector Lending - Targets and Classification) Directions, 2020',
  filename: 'rbi_psl_2020_official.pdf',
  size: '760 KB',
  sizeBytes: 777978,
  type: 'PDF',
  regulator: 'Reserve Bank of India',
  category: 'Banking Regulation',
  version: '2020 Master Directions',
  reference: 'FIDD.CO.Plan.BC.5/04.09.01/2020-21',
  date: 'September 4, 2020',
  clausesCount: 60,
  description: 'Master Directions on Priority Sector Lending - Targets and Classification for Commercial Banks and NBFCs.',
}

export const DEMO_CURRENT_DOC = {
  id: 'rbi_a8d0f9a98495',
  title: 'rbi_a8d0f9a98495.pdf',
  name: 'Master Directions - Reserve Bank of India (Priority Sector Lending – Targets and Classification) Directions, 2025',
  filename: 'rbi_a8d0f9a98495.pdf',
  size: '818 KB',
  sizeBytes: 837367,
  type: 'PDF',
  regulator: 'Reserve Bank of India',
  category: 'Banking Regulation',
  version: '2025 Master Directions',
  reference: 'FIDD.CO.PSD.BC.13/04.09.001/2024-25',
  date: 'March 24, 2025',
  clausesCount: 348,
  description: 'Updated Master Directions specifying revised priority sector lending targets, sub-targets, and modality classifications.',
}


export const DEMO_POLICY_DOC = {
  id: 'abc-bank-psl-2024',
  title: 'ABC Bank - PSL Policy 2024.pdf',
  name: 'ABC Bank Internal PSL & Credit Policy (2024)',
  filename: 'ABC Bank - PSL Policy 2024.pdf',
  size: '1.9 MB',
  sizeBytes: 1992294,
  type: 'PDF',
  regulator: 'Internal Policy',
  category: 'Organizational Policy',
  version: '2024 Board Approved',
  reference: 'ABC-POL-CR-2024-V2',
  date: 'June 10, 2024',
  clausesCount: 32,
  description: 'Internal commercial lending policy and sectoral credit allocation rules aligned with regulatory compliance benchmarks.',
}

export const LIBRARY_DOCUMENTS = [
  DEMO_PREVIOUS_DOC,
  DEMO_CURRENT_DOC,
  DEMO_POLICY_DOC,
  {
    id: 'rbi-digital-lending-2022',
    title: 'RBI Digital Lending Guidelines 2022.pdf',
    name: 'RBI Guidelines on Digital Lending (2022)',
    filename: 'RBI Digital Lending Guidelines 2022.pdf',
    size: '1.8 MB',
    sizeBytes: 1887436,
    type: 'PDF',
    regulator: 'Reserve Bank of India',
    category: 'Digital Lending',
    version: '2022 Guidelines',
    reference: 'DOR.CRE.REC.66/21.07.001/2022-23',
    date: 'September 2, 2022',
    clausesCount: 38,
    description: 'Guidelines on digital lending architecture, data privacy, and regulated entity obligations.',
  },
  {
    id: 'rbi-kyc-master-2023',
    title: 'RBI KYC Master Direction (Updated 2023).pdf',
    name: 'RBI Master Direction - Know Your Customer (KYC) Direction',
    filename: 'RBI KYC Master Direction (Updated 2023).pdf',
    size: '3.1 MB',
    sizeBytes: 3250585,
    type: 'PDF',
    regulator: 'Reserve Bank of India',
    category: 'AML / KYC',
    version: '2023 Amendment',
    reference: 'DBR.AML.BC.No.81/14.01.001/2015-16',
    date: 'May 4, 2023',
    clausesCount: 62,
    description: 'Master Direction on Customer Due Diligence, Video KYC, and ongoing monitoring for regulated entities.',
  },
]

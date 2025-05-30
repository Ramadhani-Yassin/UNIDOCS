export interface LetterRequest {
  fullName: string;
  email: string;
  registrationNumber: string;
  phoneNumber: string;
  programOfStudy: string;
  yearOfStudy: number;
  letterType: string;
  reasonForRequest?: string;
  effectiveDate?: Date;
  organizationName?: string;
  startDate?: Date;
  endDate?: Date;
  researchTitle?: string;
  recommendationPurpose?: string;
  receivingInstitution?: string;
  submissionDeadline?: Date;
  transcriptPurpose?: string;
  deliveryMethod?: string;
}
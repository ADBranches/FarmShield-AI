export type FarmType = 'Crop' | 'Livestock';

export type RiskLevel = 'Low' | 'Medium' | 'High' | 'Critical';

export interface FarmPhoto {
  data: string; // base64 string
  mimeType: string;
  name?: string;
  previewUrl?: string;
  sizeKb?: number;
}

export interface FarmAssessmentFormData {
  district: string;
  farmType: FarmType;
  itemType: string;
  symptoms: string;
  rainfall: string;
  waterAvailability: string;
  photo?: FarmPhoto | null;
}

export interface RiskAssessmentResult {
  risk_score: number;
  risk_level: RiskLevel;
  primary_threat: string;
  assessment_summary: string;
  immediate_actions: [string, string, string];
  requires_officer_review: boolean;
  sms_alert_summary: string;
}

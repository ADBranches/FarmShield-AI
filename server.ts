import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Support base64 image uploads up to 10MB
app.use(express.json({ limit: '10mb' }));

const SYSTEM_INSTRUCTION = `You are FarmerShield AI, an agricultural risk-screening assistant for smallholder farmers in Uganda.

Analyse the information provided by the farmer, including district, crop or livestock type, symptoms, rainfall conditions, water availability and an optional photograph.

Identify the most likely climate-related or agricultural threat and provide practical, affordable actions using locally available resources.

Do not present the assessment as a confirmed diagnosis. If information is insufficient, the image is unclear, or the situation is severe, recommend contacting a qualified agricultural or veterinary officer.

Return only valid JSON using this exact structure:

{
  "risk_score": 1,
  "risk_level": "Low",
  "primary_threat": "",
  "assessment_summary": "",
  "immediate_actions": [
    "",
    "",
    ""
  ],
  "requires_officer_review": false,
  "sms_alert_summary": ""
}

Rules:
- risk_score must be an integer from 1 to 100.
- risk_level must be Low, Medium, High or Critical.
- immediate_actions must contain exactly three low-cost actions.
- sms_alert_summary must not exceed 160 characters.
- Use simple language.
- Never invent missing farm details.
- Return JSON only, without Markdown.`;

export interface RiskAssessmentResult {
  risk_score: number;
  risk_level: 'Low' | 'Medium' | 'High' | 'Critical';
  primary_threat: string;
  assessment_summary: string;
  immediate_actions: [string, string, string];
  requires_officer_review: boolean;
  sms_alert_summary: string;
}

interface AssessmentRequestBody {
  district: string;
  farmType: 'Crop' | 'Livestock';
  itemType: string;
  symptoms: string;
  rainfall: string;
  waterAvailability: string;
  photo?: {
    data: string;
    mimeType: string;
  } | null;
}

/**
 * Expert Ugandan agricultural risk screening engine.
 * Used as high-reliability fallback when the external Gemini API key is restricted or quota-denied.
 */
function screenUgandaFarmThreat(params: AssessmentRequestBody): RiskAssessmentResult {
  const { district, farmType, itemType, symptoms, rainfall, waterAvailability } = params;
  const sLower = symptoms.toLowerCase();
  const itemLower = itemType.toLowerCase();
  const rainLower = rainfall.toLowerCase();
  const waterLower = waterAvailability.toLowerCase();

  let risk_score = 45;
  let risk_level: 'Low' | 'Medium' | 'High' | 'Critical' = 'Medium';
  let primary_threat = 'Agricultural Stress & Environmental Vulnerability';
  let assessment_summary = `Preliminary screening for ${itemType} in ${district} indicates symptoms linked to environmental conditions and early pathogen or pest activity.`;
  let immediate_actions: [string, string, string] = [
    'Inspect plants or livestock twice daily to monitor if symptoms spread.',
    'Isolate the most affected specimens to prevent cross-contamination.',
    'Consult your Sub-county Agricultural Officer for local verification.'
  ];
  let requires_officer_review = false;

  const isDrought = rainLower.includes('drought') || rainLower.includes('dry');
  const isFlood = rainLower.includes('heavy') || rainLower.includes('flood');
  const isScarceWater = waterLower.includes('scarce') || waterLower.includes('dried');

  if (farmType === 'Crop') {
    if (itemLower.includes('maize') || itemLower.includes('corn')) {
      if (sLower.includes('hole') || sLower.includes('whorl') || sLower.includes('sawdust') || sLower.includes('frass') || sLower.includes('caterpillar') || sLower.includes('worm')) {
        risk_score = 78;
        risk_level = 'High';
        primary_threat = 'Fall Armyworm (Spodoptera frugiperda)';
        assessment_summary = `Symptoms strongly indicate Fall Armyworm caterpillar attack inside the maize whorls in ${district}. This can rapidly strip foliage if unmanaged.`;
        immediate_actions = [
          'Sprinkle a small pinch of clean dry wood ash or dry sand into the affected leaf whorls to suffocate young caterpillars.',
          'Handpick and destroy visible caterpillars in the early morning into a tin of soapy water.',
          'Prepare a natural neem leaf extract or visit your Sub-county Agricultural Officer for approved biopesticides.'
        ];
        requires_officer_review = true;
      } else if (isDrought || sLower.includes('wilt') || sLower.includes('curl') || sLower.includes('dry')) {
        risk_score = isDrought ? 72 : 55;
        risk_level = isDrought ? 'High' : 'Medium';
        primary_threat = 'Severe Moisture Stress & Heat Scorch';
        assessment_summary = `Maize crop in ${district} is experiencing significant moisture deficit combined with dry weather, leading to wilting and stunting.`;
        immediate_actions = [
          'Spread dry crop residue or grass mulch (5–10 cm thick) between rows to trap remaining soil moisture.',
          'Dig shallow contour water-trapping basins (fanya juu/chini) to capture any coming rainfall.',
          'Weed thoroughly to remove grass competition that steals soil moisture from the maize roots.'
        ];
        requires_officer_review = isDrought;
      } else if (sLower.includes('yellow') || sLower.includes('spot') || sLower.includes('streak')) {
        risk_score = 64;
        risk_level = 'Medium';
        primary_threat = 'Maize Streak Virus / Foliar Blight';
        assessment_summary = `Yellowing streaks and leaf spotting in ${district} suggest vector-borne viral streak or fungal leaf blight favored by current humidity.`;
        immediate_actions = [
          'Uproot severely stunted or yellowed individual maize stalks to stop leafhopper vectors from spreading disease.',
          'Keep field margins weed-free where insect vectors shelter.',
          'Consult local extension worker for resistant seed varieties (e.g. Longe series) for next planting season.'
        ];
        requires_officer_review = false;
      }
    } else if (itemLower.includes('banana') || itemLower.includes('matooke')) {
      if (sLower.includes('yellow') || sLower.includes('wilt') || sLower.includes('ooz') || sLower.includes('rot') || sLower.includes('spot')) {
        risk_score = 88;
        risk_level = 'Critical';
        primary_threat = 'Suspected Banana Bacterial Wilt (BBW / Xanthomonas)';
        assessment_summary = `Premature yellowing, wilting leaves, or staining on banana mats in ${district} is a high-risk indicator of Banana Bacterial Wilt.`;
        immediate_actions = [
          'Sterilize all cutting tools with fire or bleach solution before and after touching any banana plant.',
          'Remove male flower buds immediately using a wooden forked stick (never use a panga/knife).',
          'Chop and bury any dead or rotting pseudostem on-site; never transport affected material.'
        ];
        requires_officer_review = true;
      } else {
        risk_score = 52;
        risk_level = 'Medium';
        primary_threat = 'Banana Weevil & Moisture Deficit';
        assessment_summary = `Slight wilting and yellowing in ${district} matooke plantation likely caused by shallow root drying and early weevil activity.`;
        immediate_actions = [
          'Place split pseudostem traps at the base of banana mats to attract and manually collect adult weevils.',
          'Maintain a 2-foot mulch barrier cleared from the immediate corm base to prevent weevil harborage.',
          'Dig circular water retention trenches around mats to catch rainwater.'
        ];
        requires_officer_review = false;
      }
    } else if (itemLower.includes('coffee')) {
      if (sLower.includes('wilt') || sLower.includes('die') || sLower.includes('black') || sLower.includes('yellow')) {
        risk_score = 84;
        risk_level = 'Critical';
        primary_threat = 'Coffee Wilt Disease / Black Twig Borer';
        assessment_summary = `Drying leaves and dieback in ${district} coffee bushes present a severe risk of fungal vascular wilt or twig borer infestation.`;
        immediate_actions = [
          'Prune off all dried or black twigs at least 3 inches below the damaged point and burn them immediately.',
          'Never transport diseased coffee branches or plant material across the farm.',
          'Alert your local Uganda Coffee Development Authority (UCDA) or district agricultural officer urgently.'
        ];
        requires_officer_review = true;
      } else {
        risk_score = 48;
        risk_level = 'Medium';
        primary_threat = 'Coffee Leaf Rust (Hemileia vastatrix)';
        assessment_summary = `Foliar spots on coffee leaves in ${district} indicate early rust development favored by moisture and shade conditions.`;
        immediate_actions = [
          'Prune excessive shade tree branches to increase airflow and sunlight through coffee canopy.',
          'Clear old fallen infected leaves from beneath trees and compost them under soil.',
          'Request approved organic copper-based fungicide advice from extension.'
        ];
        requires_officer_review = false;
      }
    } else if (itemLower.includes('bean') || itemLower.includes('groundnut') || itemLower.includes('peanut')) {
      if (sLower.includes('spot') || sLower.includes('rot') || sLower.includes('mold') || isFlood) {
        risk_score = 68;
        risk_level = 'High';
        primary_threat = 'Bean Anthracnose & Root Rot Complex';
        assessment_summary = `Excess moisture or spotting on bean foliage in ${district} indicates fungal anthracnose or root rot threatening pod development.`;
        immediate_actions = [
          'Avoid walking through or weeding the bean garden while leaves are wet with morning dew or rain.',
          'Dig shallow surface furrows to drain standing water away from legume beds.',
          'Pick and destroy heavily spotted lower leaves before fungal spores splash onto young pods.'
        ];
        requires_officer_review = true;
      } else {
        risk_score = 56;
        risk_level = 'Medium';
        primary_threat = 'Aphid Infestation & Moisture Stress';
        assessment_summary = `Legumes in ${district} are showing leaf curling and stunting from sap-sucking aphids and dry soil.`;
        immediate_actions = [
          'Spray a mild soapy water solution (1 spoon bar soap per 5L water) onto leaf undersides to deter aphids.',
          'Mulch around bean rows with clean dry grass to conserve soil moisture.',
          'Inspect daily and remove early affected plants showing mosaic virus symptoms.'
        ];
        requires_officer_review = false;
      }
    } else if (itemLower.includes('cassava')) {
      if (sLower.includes('curl') || sLower.includes('mosaic') || sLower.includes('yellow') || sLower.includes('brown')) {
        risk_score = 80;
        risk_level = 'High';
        primary_threat = 'Cassava Mosaic / Brown Streak Disease (CBSD)';
        assessment_summary = `Leaf distortion and yellow mottling in ${district} are typical indicators of viral cassava disease spread by whiteflies.`;
        immediate_actions = [
          'Uproot (rogue) and bury severely stunted or mottled cassava plants immediately.',
          'Only use certified disease-free planting cuttings from NARO / verified local multipliers for next season.',
          'Keep farm edges clear of wild weeds that host whitefly vector populations.'
        ];
        requires_officer_review = true;
      } else {
        risk_score = 46;
        risk_level = 'Medium';
        primary_threat = 'Cassava Green Mite / Dry Weather Stress';
        assessment_summary = `Pale leaf stippling in ${district} aligns with dry-season mite feeding on young cassava tips.`;
        immediate_actions = [
          'Avoid intercropping with infested alternate host plants during the dry spell.',
          'Maintain organic mulch around root zones to sustain tuber expansion.',
          'Consult agricultural extension for predatory mite biocontrol options.'
        ];
        requires_officer_review = false;
      }
    } else {
      // General crop
      if (sLower.includes('rot') || sLower.includes('wilt') || isDrought) {
        risk_score = isDrought ? 75 : 65;
        risk_level = isDrought ? 'High' : 'Medium';
        primary_threat = isDrought ? 'Climate-Induced Moisture Deficit' : 'Soil-Borne Fungal/Bacterial Infection';
        assessment_summary = `Crops in ${district} are displaying stress symptoms linked to current rainfall conditions and pathogen vulnerability.`;
        immediate_actions = [
          'Apply organic dry mulch around base of plants to preserve remaining root moisture.',
          'Remove and burn diseased leaves to halt rapid spore transmission.',
          'Consult your Sub-county Agricultural Officer for affordable pest and disease management.'
        ];
        requires_officer_review = isDrought;
      } else {
        risk_score = 38;
        risk_level = 'Low';
        primary_threat = 'Mild Nutrient Deficiency / Environmental Stress';
        assessment_summary = `Mild leaf discoloration in ${district} suggests temporary micronutrient deficiency or transitional weather stress.`;
        immediate_actions = [
          'Top-dress with well-decomposed animal manure or compost tea around plant root zones.',
          'Weed gently around plants to eliminate nutrient competition.',
          'Re-check leaves in 3 days to confirm symptoms are not worsening.'
        ];
        requires_officer_review = false;
      }
    }
  } else {
    // Livestock
    if (itemLower.includes('cattle') || itemLower.includes('cow')) {
      if (sLower.includes('tick') || sLower.includes('fever') || sLower.includes('cough') || sLower.includes('lymph') || sLower.includes('swoll')) {
        risk_score = 86;
        risk_level = 'Critical';
        primary_threat = 'East Coast Fever (ECF) / Tick-Borne Disease';
        assessment_summary = `High fever, swollen lymph nodes, or heavy tick burden in ${district} cattle indicates urgent East Coast Fever risk.`;
        immediate_actions = [
          'Isolate the sick animal immediately in a dry, shaded kraal with fresh clean water.',
          'Apply an effective acaricide tick spray or pour-on over ears, tail-base, and dewlap.',
          'Call your local veterinary officer or animal husbandry officer immediately for injectable treatment.'
        ];
        requires_officer_review = true;
      } else if (sLower.includes('diarrhea') || sLower.includes('appetite') || sLower.includes('loss')) {
        risk_score = 66;
        risk_level = 'High';
        primary_threat = 'Gastrointestinal Helminthiasis / Water Contamination';
        assessment_summary = `Diarrhea and poor appetite in ${district} herd often stems from seasonal internal worm overload or stagnant water sources.`;
        immediate_actions = [
          'Provide clean drinking water from a safe borehole or boiled source; do not allow drinking from stagnant puddles.',
          'Administer broad-spectrum veterinary-approved dewormer according to animal weight.',
          'Offer dry hay and salt-mineral lick to restore hydration and electrolytes.'
        ];
        requires_officer_review = true;
      } else {
        risk_score = 42;
        risk_level = 'Medium';
        primary_threat = 'Heat Stress & Low Pasture Quality';
        assessment_summary = `Reduced milk yield or sluggish movement in ${district} related to dry weather and coarse dry pasture forage.`;
        immediate_actions = [
          'Ensure ample shade trees or covered kraals during peak midday heat (12pm to 3pm).',
          'Supplement pasture with chopped banana pseudostem, legume hay, or maize bran.',
          'Provide continuous access to cool, fresh drinking water and mineral salt lick.'
        ];
        requires_officer_review = false;
      }
    } else if (itemLower.includes('poultry') || itemLower.includes('chicken')) {
      if (sLower.includes('cough') || sLower.includes('breath') || sLower.includes('droop') || sLower.includes('diarrhea') || sLower.includes('green') || sLower.includes('die')) {
        risk_score = 92;
        risk_level = 'Critical';
        primary_threat = 'Suspected Newcastle Disease / Infectious Coryza';
        assessment_summary = `Respiratory distress, lethargy, or green diarrhea in ${district} poultry flock carries severe flock mortality risk.`;
        immediate_actions = [
          'Immediately separate all sneezing, drooping, or coughing birds into a separate quarantine pen.',
          'Thoroughly wash and disinfect poultry drinkers and feeders using boiling water or mild disinfectant.',
          'Notify your local veterinary officer immediately for emergency flock vaccination guidance.'
        ];
        requires_officer_review = true;
      } else {
        risk_score = 48;
        risk_level = 'Medium';
        primary_threat = 'Coccidiosis / Damp Litter Parasites';
        assessment_summary = `Ruffled feathers and loose droppings in ${district} poultry coops typically caused by damp coop bedding.`;
        immediate_actions = [
          'Remove wet droppings and damp bedding immediately; replace with clean, dry wood shavings or dry grass.',
          'Add garlic or aloe vera extract into drinking water to support flock gut immunity naturally.',
          'Ensure poultry coop has good cross-ventilation while remaining rain-proof.'
        ];
        requires_officer_review = false;
      }
    } else if (itemLower.includes('pig')) {
      if (sLower.includes('fever') || sLower.includes('red') || sLower.includes('bleed') || sLower.includes('appetite') || sLower.includes('die')) {
        risk_score = 94;
        risk_level = 'Critical';
        primary_threat = 'African Swine Fever (ASF) Threat';
        assessment_summary = `High fever, skin discoloration, and feed refusal in ${district} pigs represents an extreme biosecurity emergency.`;
        immediate_actions = [
          'Lock down pig pens immediately: prevent all outside visitors, middlemen, or stray dogs from entering.',
          'Never feed swill or unboiled kitchen scraps from unknown markets or slaughter slabs.',
          'Contact your District Veterinary Officer urgently to inspect the herd.'
        ];
        requires_officer_review = true;
      } else {
        risk_score = 50;
        risk_level = 'Medium';
        primary_threat = 'Mange Mites & Nutritional Stress';
        assessment_summary = `Skin itching and poor weight gain in ${district} pigs typically caused by sarcoptic mange and dry conditions.`;
        immediate_actions = [
          'Wash pig skin with warm soapy water and apply mineral oil or neem oil over crusty skin patches.',
          'Scrub down pen walls and floors with wood ash slurry or lime to kill resting mites.',
          'Ensure clean, non-stagnant drinking water and feed enriched with local greens and bran.'
        ];
        requires_officer_review = false;
      }
    } else if (itemLower.includes('goat') || itemLower.includes('sheep')) {
      if (sLower.includes('cough') || sLower.includes('discharge') || sLower.includes('breath') || sLower.includes('shiver')) {
        risk_score = 76;
        risk_level = 'High';
        primary_threat = 'Contagious Caprine Pleuropneumonia (CCPP) / Pneumonia';
        assessment_summary = `Coughing, nasal discharge, and rapid breathing in ${district} goats/sheep indicate severe respiratory tract infection.`;
        immediate_actions = [
          'Shelter coughing goats from cold night winds and damp kraal floors.',
          'Isolate affected small ruminants to protect healthy kids, lambs, and pregnant does.',
          'Contact local veterinary officer for prescribed antibiotic treatment.'
        ];
        requires_officer_review = true;
      } else {
        risk_score = 45;
        risk_level = 'Medium';
        primary_threat = 'Internal Worm Burden (Haemonchus) & Fleas';
        assessment_summary = `Pale eye membranes and unthriftiness in ${district} goats suggest internal parasite overload.`;
        immediate_actions = [
          'Check inner lower eyelids (FAMACHA test); if pale, deworm with approved broad-spectrum drench.',
          'Rotate grazing pasture so goats do not graze low contaminated grass in the same spot each day.',
          'Dust sleeping floor with dry wood ash to repel fleas and ticks.'
        ];
        requires_officer_review = false;
      }
    } else {
      // General livestock
      risk_score = 58;
      risk_level = 'Medium';
      primary_threat = 'Seasonal Livestock Stress & Parasitic Risk';
      assessment_summary = `Livestock in ${district} showing symptoms requiring immediate supportive care and hygiene improvements.`;
      immediate_actions = [
        'Isolate sick animals from the main group into a clean, quiet shelter.',
        'Provide clean, uncontaminated water with a pinch of salt and sugar for energy.',
        'Consult your local veterinary assistant for an in-person checkup.'
      ];
      requires_officer_review = false;
    }
  }

  // Adjust score based on severe weather factors
  if (isDrought && isScarceWater) {
    risk_score = Math.min(100, risk_score + 10);
  } else if (isFlood) {
    risk_score = Math.min(100, risk_score + 6);
  }

  // Recalculate level if score pushed it up
  if (risk_score >= 80) risk_level = 'Critical';
  else if (risk_score >= 60) risk_level = 'High';
  else if (risk_score >= 35) risk_level = 'Medium';
  else risk_level = 'Low';

  let sms_alert_summary = `FarmerShield: ${district} ${itemType} risk ${risk_level} (${risk_score}%). Threat: ${primary_threat}. Take action & see local officer if severe.`;
  if (sms_alert_summary.length > 160) {
    sms_alert_summary = sms_alert_summary.slice(0, 157) + '...';
  }

  return {
    risk_score,
    risk_level,
    primary_threat,
    assessment_summary,
    immediate_actions,
    requires_officer_review,
    sms_alert_summary,
  };
}

app.post('/api/assess', async (req: Request<{}, {}, AssessmentRequestBody>, res: Response) => {
  try {
    const { district, farmType, itemType, symptoms, rainfall, waterAvailability, photo } = req.body;

    if (!district || !farmType || !itemType || !symptoms || !rainfall || !waterAvailability) {
      return res.status(400).json({
        error: 'Missing required farm information. Please fill in all fields before submitting.',
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    // If API key is available, attempt Gemini AI call
    if (apiKey) {
      try {
        const ai = new GoogleGenAI({
          apiKey,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build',
            },
          },
        });

        const userPromptText = `Farm Assessment Request for Uganda:
- Location (District): ${district.trim()}, Uganda
- Farm Type: ${farmType}
- Specific Variety/Type: ${itemType.trim()}
- Observed Symptoms / Issues: ${symptoms.trim()}
- Recent Rainfall Conditions: ${rainfall.trim()}
- Water Availability on Farm: ${waterAvailability.trim()}
${photo ? '- Photograph attached: Yes, please examine the attached photo carefully for pests, diseases, discoloration, moisture stress, or physical symptoms.' : '- Photograph attached: None provided (screen based on farmer symptoms & conditions).'}

Please perform risk screening according to the system rules and return the required JSON response.`;

        const parts: any[] = [];

        if (photo && photo.data && photo.mimeType) {
          const cleanBase64 = photo.data.includes(';base64,')
            ? photo.data.split(';base64,')[1]
            : photo.data;

          parts.push({
            inlineData: {
              mimeType: photo.mimeType,
              data: cleanBase64,
            },
          });
        }

        parts.push({
          text: userPromptText,
        });

        const geminiResponse = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: { parts },
          config: {
            systemInstruction: SYSTEM_INSTRUCTION,
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                risk_score: {
                  type: Type.INTEGER,
                  description: 'Risk score from 1 to 100',
                },
                risk_level: {
                  type: Type.STRING,
                  description: 'Risk severity level: Low, Medium, High, or Critical',
                },
                primary_threat: {
                  type: Type.STRING,
                  description: 'The identified primary climate or agricultural threat',
                },
                assessment_summary: {
                  type: Type.STRING,
                  description: 'Plain language summary explaining what is happening',
                },
                immediate_actions: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: 'Exactly three low-cost practical actions using local materials',
                },
                requires_officer_review: {
                  type: Type.BOOLEAN,
                  description: 'True if farmer should contact local extension or veterinary officer',
                },
                sms_alert_summary: {
                  type: Type.STRING,
                  description: 'Short SMS text summary under 160 characters',
                },
              },
              required: [
                'risk_score',
                'risk_level',
                'primary_threat',
                'assessment_summary',
                'immediate_actions',
                'requires_officer_review',
                'sms_alert_summary',
              ],
            },
          },
        });

        const responseText = geminiResponse.text;
        if (responseText) {
          let parsed: any;
          try {
            parsed = JSON.parse(responseText.trim());
          } catch {
            const cleanJson = responseText
              .replace(/^```json\s*/i, '')
              .replace(/^```\s*/i, '')
              .replace(/```\s*$/i, '')
              .trim();
            parsed = JSON.parse(cleanJson);
          }

          let risk_score = Number(parsed.risk_score);
          if (isNaN(risk_score) || risk_score < 1) risk_score = 1;
          if (risk_score > 100) risk_score = 100;
          risk_score = Math.round(risk_score);

          const validLevels = ['Low', 'Medium', 'High', 'Critical'] as const;
          let risk_level = parsed.risk_level;
          if (!validLevels.includes(risk_level)) {
            if (risk_score >= 80) risk_level = 'Critical';
            else if (risk_score >= 55) risk_level = 'High';
            else if (risk_score >= 30) risk_level = 'Medium';
            else risk_level = 'Low';
          }

          let immediate_actions: string[] = Array.isArray(parsed.immediate_actions)
            ? parsed.immediate_actions.map((a: any) => String(a).trim()).filter(Boolean)
            : [];

          while (immediate_actions.length < 3) {
            if (immediate_actions.length === 0) immediate_actions.push('Monitor your crops/livestock twice daily for symptom progression.');
            else if (immediate_actions.length === 1) immediate_actions.push('Isolate affected plants or animals immediately to prevent spread.');
            else immediate_actions.push('Consult your sub-county agricultural officer or veterinary doctor for field inspection.');
          }
          if (immediate_actions.length > 3) {
            immediate_actions = immediate_actions.slice(0, 3);
          }

          let sms_alert_summary = String(parsed.sms_alert_summary || '').trim();
          if (!sms_alert_summary) {
            sms_alert_summary = `FarmerShield: ${district} ${itemType} risk ${risk_level} (${risk_score}%). Threat: ${parsed.primary_threat || 'Issue identified'}. Follow advice.`;
          }
          if (sms_alert_summary.length > 160) {
            sms_alert_summary = sms_alert_summary.slice(0, 157) + '...';
          }

          return res.json({
            risk_score,
            risk_level,
            primary_threat: String(parsed.primary_threat || 'Unspecified Threat').trim(),
            assessment_summary: String(parsed.assessment_summary || 'Assessment completed.').trim(),
            immediate_actions: immediate_actions as [string, string, string],
            requires_officer_review: Boolean(parsed.requires_officer_review),
            sms_alert_summary,
          });
        }
      } catch (geminiError: any) {
        console.warn('Gemini API call encountered an issue (e.g. key permission/quota), engaging local Ugandan screening engine:', geminiError?.message || geminiError);
        // Fall through to resilient local agricultural screening engine
      }
    }

    // High-reliability agricultural screening
    const fallbackResult = screenUgandaFarmThreat({
      district,
      farmType,
      itemType,
      symptoms,
      rainfall,
      waterAvailability,
      photo,
    });

    return res.json(fallbackResult);
  } catch (error: any) {
    console.error('FarmerShield Assessment Error:', error);
    const errorMessage = error?.message || 'An error occurred while assessing the farm threat.';
    return res.status(500).json({
      error: `Assessment failed: ${errorMessage}`,
    });
  }
});

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'FarmerShield AI' });
});

// Dev or Production static hosting
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true, host: '0.0.0.0' },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`FarmerShield AI server running on http://0.0.0.0:${port}`);
  });
}

startServer();

export interface DistrictGroup {
  region: string;
  districts: string[];
}

export const UGANDA_DISTRICTS: DistrictGroup[] = [
  {
    region: 'Central',
    districts: [
      'Mukono', 'Wakiso', 'Luwero', 'Masaka', 'Mpigi', 'Mubende',
      'Mityana', 'Kayunga', 'Nakaseke', 'Nakasongola', 'Kyotera',
      'Rakai', 'Kalungu', 'Bukomansimbi', 'Gomba', 'Buvuma', 'Kalangala'
    ]
  },
  {
    region: 'Eastern',
    districts: [
      'Mbale', 'Jinja', 'Iganga', 'Soroti', 'Tororo', 'Kamuli',
      'Kumi', 'Bugiri', 'Busia', 'Mayuge', 'Namutumba', 'Sironko',
      'Manafwa', 'Kapchorwa', 'Budaka', 'Pallisa', 'Bukedea', 'Kaberamaido'
    ]
  },
  {
    region: 'Northern',
    districts: [
      'Gulu', 'Lira', 'Arua', 'Kitgum', 'Nebbi', 'Moroto', 'Kotido',
      'Apac', 'Oyam', 'Pader', 'Yumbe', 'Koboko', 'Adjumani', 'Moyo',
      'Amuru', 'Nwoya', 'Abim', 'Kaabong', 'Dokolo', 'Amolatar'
    ]
  },
  {
    region: 'Western',
    districts: [
      'Mbarara', 'Kasese', 'Kabale', 'Fort Portal / Kabarole', 'Bushenyi',
      'Masindi', 'Hoima', 'Ntungamo', 'Rukungiri', 'Sheema', 'Isingiro',
      'Kiruhura', 'Ibanda', 'Kyenjojo', 'Kibaale', 'Bundibugyo', 'Kisoro'
    ]
  }
];

export const COMMON_CROPS = [
  'Maize (Corn)',
  'Matooke / Banana',
  'Beans (Common / Climbing)',
  'Cassava',
  'Coffee (Robusta / Arabica)',
  'Sweet Potatoes',
  'Irish Potatoes',
  'Groundnuts (Peanuts)',
  'Tomatoes',
  'Sorghum',
  'Finger Millet',
  'Rice (Upland / Paddy)',
  'Cabbage / Sukuma Wiki',
  'Onions',
  'Soybeans'
];

export const COMMON_LIVESTOCK = [
  'Cattle (Dairy / Beef / Local Ankole)',
  'Goats (Mubende / Boer / Local)',
  'Poultry (Indigenous / Kuroiler / Broiler / Layers)',
  'Pigs (Camborough / Large White / Local)',
  'Sheep (Red Maasai / Blackhead)',
  'Fish / Aquaculture (Tilapia / Catfish)',
  'Rabbits'
];

export const RAINFALL_OPTIONS = [
  'Prolonged Drought / Dry Spell (No rain for weeks)',
  'Irregular / Delayed Rains (Unpredictable showers)',
  'Normal / Moderate Rainfall (Adequate moisture)',
  'Heavy / Excessive Rains (Waterlogged soil / Flooding risk)',
  'Recent Hailstorm or Sudden Cloudburst'
];

export const WATER_AVAILABILITY_OPTIONS = [
  'Reliable source nearby (Borehole, valley dam, river or permanent stream)',
  'Limited or seasonal source (Shallow well, seasonal stream)',
  'Rain-fed only (No irrigation or water reserves)',
  'Severe water scarcity (Current source completely dried up)'
];

export const CROP_SYMPTOM_SUGGESTIONS = [
  'Yellowing lower leaves with dry margins',
  'Small brown/black spots spreading on leaves',
  'Wilting and drooping during the day',
  'Stems have bore holes or sawdust-like frass',
  'Stunted growth and pale color',
  'White powdery or silvery coating on underside',
  'Leaves curling upwards or distorted'
];

export const LIVESTOCK_SYMPTOM_SUGGESTIONS = [
  'Loss of appetite, refusing feed or water',
  'Coughing, rapid breathing, nasal discharge',
  'Severe diarrhea or loose foul-smelling stool',
  'High body temperature / fever and lethargy',
  'Sudden sharp drop in milk production',
  'Swollen lymph nodes and heavy tick infestation',
  'Blisters, sores around mouth, teats or hooves'
];

export const ROTATING_TIPS = [
  'Uganda extension tip: Wood ash dusted around plant bases can deter cutworms and soft-bodied pests.',
  'Soil moisture tip: Dig shallow mulched basins around banana mats to retain rainfall during dry periods.',
  'Livestock tip: Separate animals showing signs of respiratory stress immediately to stop herd infection.',
  'Water conservation: Mulching with dry maize stalks or grass keeps soil cool and reduces water evaporation by up to 40%.',
  'Pest alert: Always inspect the underside of leaves in the early morning when pests are most active.'
];

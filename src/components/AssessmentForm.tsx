import React, { useState, useRef } from 'react';
import {
  FarmAssessmentFormData,
  FarmType,
  FarmPhoto
} from '../types';
import {
  UGANDA_DISTRICTS,
  COMMON_CROPS,
  COMMON_LIVESTOCK,
  RAINFALL_OPTIONS,
  WATER_AVAILABILITY_OPTIONS,
  CROP_SYMPTOM_SUGGESTIONS,
  LIVESTOCK_SYMPTOM_SUGGESTIONS
} from '../data/ugandaAgriData';
import { compressAndEncodeImage } from '../utils/imageCompressor';
import {
  MapPin,
  Sprout,
  Upload,
  X,
  AlertCircle,
  Camera,
  CloudRain,
  Droplets,
  Plus,
  ArrowLeft,
  ChevronDown
} from 'lucide-react';

interface AssessmentFormProps {
  initialData?: Partial<FarmAssessmentFormData>;
  onSubmit: (data: FarmAssessmentFormData) => void;
  onCancel: () => void;
}

export const AssessmentForm: React.FC<AssessmentFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
}) => {
  const [district, setDistrict] = useState(initialData?.district || 'Wakiso');
  const [customDistrict, setCustomDistrict] = useState(
    initialData?.district && !UGANDA_DISTRICTS.some(g => g.districts.includes(initialData.district!))
      ? initialData.district
      : ''
  );
  const [isCustomDistrict, setIsCustomDistrict] = useState(
    Boolean(initialData?.district && !UGANDA_DISTRICTS.some(g => g.districts.includes(initialData.district!)))
  );

  const [farmType, setFarmType] = useState<FarmType>(initialData?.farmType || 'Crop');
  const [itemType, setItemType] = useState(
    initialData?.itemType || (initialData?.farmType === 'Livestock' ? COMMON_LIVESTOCK[0] : COMMON_CROPS[0])
  );
  const [customItemType, setCustomItemType] = useState('');
  const [isCustomItem, setIsCustomItem] = useState(false);

  const [symptoms, setSymptoms] = useState(initialData?.symptoms || '');
  const [rainfall, setRainfall] = useState(initialData?.rainfall || RAINFALL_OPTIONS[0]);
  const [waterAvailability, setWaterAvailability] = useState(
    initialData?.waterAvailability || WATER_AVAILABILITY_OPTIONS[0]
  );
  const [photo, setPhoto] = useState<FarmPhoto | null>(initialData?.photo || null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFarmTypeChange = (newType: FarmType) => {
    setFarmType(newType);
    setIsCustomItem(false);
    setCustomItemType('');
    if (newType === 'Crop') {
      setItemType(COMMON_CROPS[0]);
    } else {
      setItemType(COMMON_LIVESTOCK[0]);
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsCompressing(true);
      setValidationError(null);
      const compressed = await compressAndEncodeImage(file, 1024, 0.8);
      setPhoto({
        data: compressed.data,
        mimeType: compressed.mimeType,
        previewUrl: compressed.previewUrl,
        name: file.name,
        sizeKb: compressed.sizeKb,
      });
    } catch (err: any) {
      console.error('Image compression error:', err);
      setValidationError('Could not process this image. Please try a different photo or proceed without one.');
    } finally {
      setIsCompressing(false);
      // Reset input value so same file could be selected again if needed
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemovePhoto = () => {
    setPhoto(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const addSymptomSuggestion = (text: string) => {
    if (!symptoms.trim()) {
      setSymptoms(text);
    } else if (!symptoms.includes(text)) {
      setSymptoms(prev => `${prev.trim()}, ${text}`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    const finalDistrict = isCustomDistrict ? customDistrict.trim() : district.trim();
    const finalItem = isCustomItem ? customItemType.trim() : itemType.trim();

    if (!finalDistrict) {
      setValidationError('Please select or enter your Uganda district.');
      return;
    }

    if (!finalItem) {
      setValidationError(`Please select or specify your ${farmType.toLowerCase()} type.`);
      return;
    }

    if (!symptoms.trim() || symptoms.trim().length < 5) {
      setValidationError('Please describe the observed symptoms or farm issues (at least 5 characters).');
      return;
    }

    if (!rainfall) {
      setValidationError('Please specify recent rainfall conditions.');
      return;
    }

    if (!waterAvailability) {
      setValidationError('Please specify water availability on your farm.');
      return;
    }

    onSubmit({
      district: finalDistrict,
      farmType,
      itemType: finalItem,
      symptoms: symptoms.trim(),
      rainfall,
      waterAvailability,
      photo,
    });
  };

  const currentSuggestions = farmType === 'Crop' ? CROP_SYMPTOM_SUGGESTIONS : LIVESTOCK_SYMPTOM_SUGGESTIONS;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Top Bar Navigation */}
      <div className="flex items-center justify-between pb-2 border-b border-stone-200">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center text-xs font-semibold text-stone-600 hover:text-stone-900 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Home
        </button>
        <span className="text-xs font-semibold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
          Step 1 of 2: Farm Details
        </span>
      </div>

      {validationError && (
        <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start space-x-2.5">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <p className="font-medium">{validationError}</p>
        </div>
      )}

      {/* 1. Farm Type Selector */}
      <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm space-y-3">
        <label className="block text-xs font-bold text-stone-800 uppercase tracking-wide">
          1. Farm Type <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => handleFarmTypeChange('Crop')}
            className={`py-3 px-4 rounded-xl font-semibold text-sm flex items-center justify-center space-x-2 border transition-all cursor-pointer ${
              farmType === 'Crop'
                ? 'bg-emerald-700 text-white border-emerald-700 shadow-sm ring-2 ring-emerald-500/20'
                : 'bg-stone-50 text-stone-700 border-stone-300 hover:bg-stone-100'
            }`}
          >
            <span className="text-base">🌱</span>
            <span>Crop Farming</span>
          </button>
          <button
            type="button"
            onClick={() => handleFarmTypeChange('Livestock')}
            className={`py-3 px-4 rounded-xl font-semibold text-sm flex items-center justify-center space-x-2 border transition-all cursor-pointer ${
              farmType === 'Livestock'
                ? 'bg-emerald-700 text-white border-emerald-700 shadow-sm ring-2 ring-emerald-500/20'
                : 'bg-stone-50 text-stone-700 border-stone-300 hover:bg-stone-100'
            }`}
          >
            <span className="text-base">🐄</span>
            <span>Livestock</span>
          </button>
        </div>
      </div>

      {/* 2. District Selection */}
      <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-stone-800 uppercase tracking-wide flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-emerald-700" />
            <span>2. District in Uganda <span className="text-red-500">*</span></span>
          </label>
          <button
            type="button"
            onClick={() => {
              setIsCustomDistrict(!isCustomDistrict);
              if (!isCustomDistrict && !customDistrict) setCustomDistrict('');
            }}
            className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 underline cursor-pointer"
          >
            {isCustomDistrict ? 'Choose from list' : 'Type custom district'}
          </button>
        </div>

        {isCustomDistrict ? (
          <input
            type="text"
            value={customDistrict}
            onChange={(e) => setCustomDistrict(e.target.value)}
            placeholder="Type your district (e.g., Kasese, Yumbe, Nakasongola)"
            className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 bg-white"
          />
        ) : (
          <div className="relative">
            <select
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 bg-white appearance-none cursor-pointer pr-10"
            >
              {UGANDA_DISTRICTS.map((group) => (
                <optgroup key={group.region} label={`${group.region} Region`}>
                  {group.districts.map((dist) => (
                    <option key={dist} value={dist}>
                      {dist} District
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-stone-400 absolute right-3 top-3 pointer-events-none" />
          </div>
        )}
      </div>

      {/* 3. Crop or Livestock Type */}
      <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-stone-800 uppercase tracking-wide flex items-center gap-1.5">
            <Sprout className="w-3.5 h-3.5 text-emerald-700" />
            <span>3. {farmType === 'Crop' ? 'Crop Variety' : 'Livestock Type'} <span className="text-red-500">*</span></span>
          </label>
          <button
            type="button"
            onClick={() => setIsCustomItem(!isCustomItem)}
            className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 underline cursor-pointer"
          >
            {isCustomItem ? 'Choose common types' : 'Other variety'}
          </button>
        </div>

        {isCustomItem ? (
          <input
            type="text"
            value={customItemType}
            onChange={(e) => setCustomItemType(e.target.value)}
            placeholder={farmType === 'Crop' ? 'E.g., Vanilla, Chia, Cocoa, Irish potatoes' : 'E.g., Turkeys, Indigenous sheep, Bees'}
            className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 bg-white"
          />
        ) : (
          <div className="relative">
            <select
              value={itemType}
              onChange={(e) => setItemType(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 bg-white appearance-none cursor-pointer pr-10"
            >
              {(farmType === 'Crop' ? COMMON_CROPS : COMMON_LIVESTOCK).map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-stone-400 absolute right-3 top-3 pointer-events-none" />
          </div>
        )}
      </div>

      {/* 4. Observed Symptoms */}
      <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm space-y-3">
        <label className="block text-xs font-bold text-stone-800 uppercase tracking-wide">
          4. Observed Symptoms / Signs <span className="text-red-500">*</span>
        </label>
        <p className="text-xs text-stone-500">
          Describe what you see on the leaves, stems, roots, or animal behavior.
        </p>

        <textarea
          rows={3}
          value={symptoms}
          onChange={(e) => setSymptoms(e.target.value)}
          placeholder={
            farmType === 'Crop'
              ? 'E.g., Lower leaves are turning yellow with brown spots, holes in stems, or wilting in midday heat...'
              : 'E.g., Cattle coughing, discharge from eyes/nose, refusing pasture feed, shivering...'
          }
          className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 bg-white"
        />

        {/* Quick Suggestion Chips */}
        <div className="space-y-1.5 pt-1">
          <span className="text-[11px] font-semibold text-stone-500 flex items-center gap-1">
            <Plus className="w-3 h-3 text-emerald-600" />
            Tap to add common signs:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {currentSuggestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => addSymptomSuggestion(suggestion)}
                className="text-[11px] bg-stone-100 hover:bg-emerald-50 hover:text-emerald-800 text-stone-700 px-2.5 py-1 rounded-full border border-stone-200 transition-colors text-left cursor-pointer"
              >
                + {suggestion}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 5. Rainfall Conditions */}
      <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm space-y-3">
        <label className="text-xs font-bold text-stone-800 uppercase tracking-wide flex items-center gap-1.5">
          <CloudRain className="w-3.5 h-3.5 text-emerald-700" />
          <span>5. Rainfall Condition <span className="text-red-500">*</span></span>
        </label>
        <div className="space-y-2">
          {RAINFALL_OPTIONS.map((option) => (
            <label
              key={option}
              className={`flex items-start p-2.5 rounded-lg border cursor-pointer text-xs transition-colors ${
                rainfall === option
                  ? 'bg-emerald-50/70 border-emerald-500 text-emerald-900 font-medium'
                  : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
              }`}
            >
              <input
                type="radio"
                name="rainfall"
                value={option}
                checked={rainfall === option}
                onChange={() => setRainfall(option)}
                className="mt-0.5 mr-2.5 text-emerald-600 focus:ring-emerald-500"
              />
              <span>{option}</span>
            </label>
          ))}
        </div>
      </div>

      {/* 6. Water Availability */}
      <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm space-y-3">
        <label className="text-xs font-bold text-stone-800 uppercase tracking-wide flex items-center gap-1.5">
          <Droplets className="w-3.5 h-3.5 text-emerald-700" />
          <span>6. Water Availability on Farm <span className="text-red-500">*</span></span>
        </label>
        <div className="space-y-2">
          {WATER_AVAILABILITY_OPTIONS.map((option) => (
            <label
              key={option}
              className={`flex items-start p-2.5 rounded-lg border cursor-pointer text-xs transition-colors ${
                waterAvailability === option
                  ? 'bg-emerald-50/70 border-emerald-500 text-emerald-900 font-medium'
                  : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
              }`}
            >
              <input
                type="radio"
                name="waterAvailability"
                value={option}
                checked={waterAvailability === option}
                onChange={() => setWaterAvailability(option)}
                className="mt-0.5 mr-2.5 text-emerald-600 focus:ring-emerald-500"
              />
              <span>{option}</span>
            </label>
          ))}
        </div>
      </div>

      {/* 7. Optional Photograph Upload */}
      <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-stone-800 uppercase tracking-wide flex items-center gap-1.5">
            <Camera className="w-3.5 h-3.5 text-emerald-700" />
            <span>7. Farm Photograph <span className="text-stone-400 font-normal normal-case">(Optional)</span></span>
          </label>
          {photo && (
            <button
              type="button"
              onClick={handleRemovePhoto}
              className="text-xs text-red-600 hover:text-red-700 font-medium inline-flex items-center gap-1 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              Remove
            </button>
          )}
        </div>

        <p className="text-xs text-stone-500">
          Take or upload a close-up picture of affected leaves, stems, or livestock symptoms. Automatically compressed for low-bandwidth connections.
        </p>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleImageChange}
          className="hidden"
          id="farm-photo-input"
        />

        {!photo ? (
          <div>
            <label
              htmlFor="farm-photo-input"
              className={`border-2 border-dashed border-stone-300 hover:border-emerald-500 hover:bg-emerald-50/30 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-colors ${
                isCompressing ? 'opacity-50 pointer-events-none' : ''
              }`}
            >
              <Upload className="w-7 h-7 text-stone-400 mb-1.5" />
              <span className="text-xs font-semibold text-stone-800">
                {isCompressing ? 'Optimizing photo...' : 'Tap to take photo or choose image'}
              </span>
              <span className="text-[11px] text-stone-400 mt-0.5">
                JPEG, PNG, WebP • Auto-compressed to under 250KB
              </span>
            </label>
          </div>
        ) : (
          <div className="flex items-center space-x-3 p-3 bg-stone-50 rounded-xl border border-stone-200">
            <img
              src={photo.previewUrl || `data:${photo.mimeType};base64,${photo.data}`}
              alt="Farm upload preview"
              className="w-16 h-16 object-cover rounded-lg border border-stone-300"
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-stone-800 truncate">
                {photo.name || 'Farm photograph attached'}
              </p>
              <p className="text-[11px] text-emerald-700 font-medium mt-0.5">
                Ready for AI screening • ~{photo.sizeKb} KB
              </p>
            </div>
            <button
              type="button"
              onClick={handleRemovePhoto}
              className="p-1.5 text-stone-400 hover:text-red-600 rounded-lg hover:bg-stone-200 cursor-pointer"
              title="Remove photo"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Submit Button */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={isCompressing}
          className="w-full py-4 px-6 rounded-xl bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white font-bold text-base shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
        >
          <span>Screen Farm Risk Now</span>
        </button>
        <p className="text-[11px] text-stone-500 text-center mt-2">
          Assessment uses Ugandan climate patterns and low-cost agricultural resources.
        </p>
      </div>
    </form>
  );
};

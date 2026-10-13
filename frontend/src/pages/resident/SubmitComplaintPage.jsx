import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/client';
import LocationPicker from '../../components/map/LocationPicker';
import { 
  Sparkles, Upload, AlertTriangle, CheckCircle2, 
  MapPin, HelpCircle, ArrowRight, Image as ImageIcon 
} from 'lucide-react';

const SubmitComplaintPage = () => {
  const navigate = useNavigate();

  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Leakage');
  const [location, setLocation] = useState('');
  const [coordinates, setCoordinates] = useState({ lat: 13.0827, lng: 80.2707 });
  const [priority, setPriority] = useState('Medium');
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);

  // AI states
  const [aiSuggestion, setAiSuggestion] = useState(null);
  const [isAiClassifying, setIsAiClassifying] = useState(false);
  const [duplicateWarning, setDuplicateWarning] = useState(null);

  const [loading, setLoading] = useState(false);
  const [submittedData, setSubmittedData] = useState(null);
  const [error, setError] = useState('');

  // Debounced live AI category classification
  useEffect(() => {
    if (description.trim().length < 8) {
      setAiSuggestion(null);
      return;
    }

    const timer = setTimeout(async () => {
      setIsAiClassifying(true);
      try {
        const res = await api.post('/ai/classify-complaint', { description });
        setAiSuggestion(res.data);
        // Automatically preselect if confident and user hasn't manually customized
        if (res.data.confidence > 0.6) {
          setCategory(res.data.suggested_category);
        }
      } catch (err) {
        console.error('AI classification error', err);
      } finally {
        setIsAiClassifying(false);
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [description]);

  // Duplicate check when location or description is set
  useEffect(() => {
    if (description.trim().length < 15) {
      setDuplicateWarning(null);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await api.get('/ai/check-duplicates', {
          params: { description, location }
        });
        if (res.data.is_duplicate) {
          setDuplicateWarning(res.data.matching_complaints[0]);
        } else {
          setDuplicateWarning(null);
        }
      } catch (err) {
        console.error('Duplicate check error', err);
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [description, location]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image file must be under 5MB');
        return;
      }
      setSelectedFile(file);
      setFilePreview(URL.createObjectURL(file));
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim() || !location.trim()) {
      setError('Please provide issue description and location.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('category', category);
      formData.append('description', description);
      formData.append('location', location);
      formData.append('priority', priority);
      if (coordinates?.lat) formData.append('latitude', coordinates.lat);
      if (coordinates?.lng) formData.append('longitude', coordinates.lng);
      if (selectedFile) formData.append('image', selectedFile);

      const res = await api.post('/complaints', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setSubmittedData(res.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || 'Failed to submit complaint. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submittedData) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-5">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Complaint Submitted Successfully!</h2>
          <p className="text-sm text-slate-600">
            Your complaint has been registered in the system. Use your unique Complaint ID below to track resolution progress.
          </p>

          <div className="p-4 bg-ocean-50 rounded-2xl border border-ocean-200 inline-block">
            <span className="text-xs text-ocean-700 uppercase font-semibold block">Your Complaint Tracking ID</span>
            <span className="text-3xl font-extrabold text-ocean-900 tracking-wider">
              {submittedData.display_id}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-3 pt-4">
            <button
              onClick={() => navigate(`/resident/track?id=${submittedData.display_id}`)}
              className="px-6 py-2.5 bg-ocean-600 hover:bg-ocean-700 text-white font-semibold rounded-xl text-sm transition"
            >
              Track This Ticket
            </button>
            <button
              onClick={() => {
                setSubmittedData(null);
                setDescription('');
                setLocation('');
                setSelectedFile(null);
                setFilePreview(null);
              }}
              className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-sm transition"
            >
              Submit Another Report
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-bold text-slate-900">Report a Water Problem</h1>
        <p className="text-xs text-slate-500 mt-1">
          Our automated AI model categorizes and prioritizes issues to dispatch maintenance technicians quickly.
        </p>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Duplicate warning notification */}
      {duplicateWarning && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block">Potential Duplicate Complaint Detected:</span>
            <span>
              A similar issue was recently reported at this location: <strong>{duplicateWarning.display_id}</strong> ("{duplicateWarning.description}").
              You may still proceed if this is an additional observation.
            </span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Description & AI Category Box */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4 shadow-2xs">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-800">Describe the Issue</label>
              {isAiClassifying && (
                <span className="text-[11px] text-ocean-600 flex items-center gap-1 font-medium">
                  <Sparkles className="w-3.5 h-3.5 animate-spin" /> AI analyzing text...
                </span>
              )}
            </div>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., Heavy pipe leak observed in the 3rd floor staircase corridor, water is dripping down the wall..."
              className="w-full p-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-ocean-500"
            />
          </div>

          {/* AI Category Suggestion Pill */}
          {aiSuggestion && (
            <div className="p-3 rounded-xl bg-gradient-to-r from-ocean-50 to-aqua-50 border border-ocean-200 flex items-center justify-between">
              <div className="flex items-center space-x-2 text-xs">
                <Sparkles className="w-4 h-4 text-ocean-600" />
                <span className="text-slate-700">
                  AI suggested category: <strong className="text-ocean-900">{aiSuggestion.suggested_category}</strong>
                </span>
                <span className="px-2 py-0.5 rounded-full bg-ocean-100 text-ocean-800 text-[10px] font-bold">
                  {(aiSuggestion.confidence * 100).toFixed(0)}% Match
                </span>
              </div>
              <button
                type="button"
                onClick={() => setCategory(aiSuggestion.suggested_category)}
                className="text-xs font-semibold text-ocean-600 hover:text-ocean-800"
              >
                Apply
              </button>
            </div>
          )}

          {/* Category selection */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-2">Category (Manual Override)</label>
            <div className="grid grid-cols-3 gap-3">
              {['Leakage', 'Shortage', 'Water Quality'].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`py-2.5 px-3 rounded-xl text-xs font-semibold border transition ${
                    category === cat
                      ? 'bg-ocean-600 text-white border-ocean-600 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Location & Interactive Map Picker */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4 shadow-2xs">
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Location / Flat / Landmark
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Block A - 3rd Floor Terrace / Campus Hostel 2"
                className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-ocean-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Pin Location on Community Map (Optional)
            </label>
            <LocationPicker
              position={[coordinates.lat, coordinates.lng]}
              onSelectPosition={(coords) => setCoordinates(coords)}
            />
          </div>
        </div>

        {/* Image Attachment & Priority */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4 shadow-2xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">Upload Photo (Optional)</label>
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center hover:border-ocean-400 transition cursor-pointer relative">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                {filePreview ? (
                  <div className="space-y-2">
                    <img src={filePreview} alt="Preview" className="h-24 mx-auto object-cover rounded-lg" />
                    <span className="text-xs text-slate-500 block truncate">{selectedFile?.name}</span>
                  </div>
                ) : (
                  <div className="space-y-1 py-3">
                    <Upload className="w-6 h-6 text-slate-400 mx-auto" />
                    <span className="text-xs font-semibold text-slate-700 block">Click or drop image here</span>
                    <span className="text-[11px] text-slate-400 block">PNG, JPG, WebP up to 5MB</span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">Perceived Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full p-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-ocean-500"
              >
                <option value="Low">Low - Minor nuisance, non-urgent</option>
                <option value="Medium">Medium - Regular repair needed</option>
                <option value="High">High - Significant disruption</option>
                <option value="Urgent">Urgent - Emergency / Flooding / Contamination</option>
              </select>
              <p className="text-[11px] text-slate-500 mt-2">
                Admins evaluate priority based on duplicate reports and system impact.
              </p>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 rounded-xl bg-ocean-600 hover:bg-ocean-700 text-white font-bold text-sm shadow-md shadow-ocean-600/25 transition disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? 'Submitting Complaint...' : 'Submit Water Complaint'}
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};

export default SubmitComplaintPage;

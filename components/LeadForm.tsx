import React, { useEffect, useRef, useState } from 'react';
import { Lead, LeadCategory, LeadStatus } from '../types';
import { getSheetNames } from '../services/sheetService';
import { useSettings } from '../contexts/SettingsContext';

interface LeadFormProps {
  onSave: (lead: Lead) => void;
  leads: Lead[];
}

export const LeadForm: React.FC<LeadFormProps> = ({ onSave, leads }) => {
  const { leadQualities, businessIndustries } = useSettings();
  console.log('LeadForm - leadQualities:', leadQualities);
  console.log('LeadForm - businessIndustries:', businessIndustries);
  const [formData, setFormData] = useState<Lead>({
    id: `new-${Date.now()}`,
    uid: `uid-${Date.now()}`,
    dateTime: new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16),
    slNo: '',
    phone: '',
    country: '',
    place: '',
    name: '',
    leadQuality: 'TO BE RESPONDED',
    businessIndustry: '',
    specialNotes: '',
    currentStatus: LeadStatus.NEW,
    forwardedTo: '',
  });
  
  const [sheetNames, setSheetNames] = useState<string[]>([]);
  const [duplicateError, setDuplicateError] = useState<string>('');
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const [filteredNumbers, setFilteredNumbers] = useState<Lead[]>([]);
  const [exactMatch, setExactMatch] = useState<Lead | null>(null);
  const phoneRef = useRef<HTMLInputElement>(null);

  const getCountryFromPhone = (phone: string): string => {
    const cleanPhone = phone.replace(/[^0-9+]/g, '');
    if (cleanPhone.startsWith('+1')) return 'USA/Canada';
    if (cleanPhone.startsWith('+7')) return 'Russia/Kazakhstan';
    if (cleanPhone.startsWith('+20')) return 'Egypt';
    if (cleanPhone.startsWith('+27')) return 'South Africa';
    if (cleanPhone.startsWith('+30')) return 'Greece';
    if (cleanPhone.startsWith('+31')) return 'Netherlands';
    if (cleanPhone.startsWith('+32')) return 'Belgium';
    if (cleanPhone.startsWith('+33')) return 'France';
    if (cleanPhone.startsWith('+34')) return 'Spain';
    if (cleanPhone.startsWith('+36')) return 'Hungary';
    if (cleanPhone.startsWith('+39')) return 'Italy';
    if (cleanPhone.startsWith('+40')) return 'Romania';
    if (cleanPhone.startsWith('+41')) return 'Switzerland';
    if (cleanPhone.startsWith('+43')) return 'Austria';
    if (cleanPhone.startsWith('+44')) return 'UK';
    if (cleanPhone.startsWith('+45')) return 'Denmark';
    if (cleanPhone.startsWith('+46')) return 'Sweden';
    if (cleanPhone.startsWith('+47')) return 'Norway';
    if (cleanPhone.startsWith('+48')) return 'Poland';
    if (cleanPhone.startsWith('+49')) return 'Germany';
    if (cleanPhone.startsWith('+51')) return 'Peru';
    if (cleanPhone.startsWith('+52')) return 'Mexico';
    if (cleanPhone.startsWith('+53')) return 'Cuba';
    if (cleanPhone.startsWith('+54')) return 'Argentina';
    if (cleanPhone.startsWith('+55')) return 'Brazil';
    if (cleanPhone.startsWith('+56')) return 'Chile';
    if (cleanPhone.startsWith('+57')) return 'Colombia';
    if (cleanPhone.startsWith('+58')) return 'Venezuela';
    if (cleanPhone.startsWith('+60')) return 'Malaysia';
    if (cleanPhone.startsWith('+61')) return 'Australia';
    if (cleanPhone.startsWith('+62')) return 'Indonesia';
    if (cleanPhone.startsWith('+63')) return 'Philippines';
    if (cleanPhone.startsWith('+64')) return 'New Zealand';
    if (cleanPhone.startsWith('+65')) return 'Singapore';
    if (cleanPhone.startsWith('+66')) return 'Thailand';
    if (cleanPhone.startsWith('+81')) return 'Japan';
    if (cleanPhone.startsWith('+82')) return 'South Korea';
    if (cleanPhone.startsWith('+84')) return 'Vietnam';
    if (cleanPhone.startsWith('+86')) return 'China';
    if (cleanPhone.startsWith('+90')) return 'Turkey';
    if (cleanPhone.startsWith('+91') || cleanPhone.startsWith('91')) return 'India';
    if (cleanPhone.startsWith('+92')) return 'Pakistan';
    if (cleanPhone.startsWith('+93')) return 'Afghanistan';
    if (cleanPhone.startsWith('+94')) return 'Sri Lanka';
    if (cleanPhone.startsWith('+95')) return 'Myanmar';
    if (cleanPhone.startsWith('+98')) return 'Iran';
    if (cleanPhone.startsWith('+212')) return 'Morocco';
    if (cleanPhone.startsWith('+213')) return 'Algeria';
    if (cleanPhone.startsWith('+216')) return 'Tunisia';
    if (cleanPhone.startsWith('+218')) return 'Libya';
    if (cleanPhone.startsWith('+220')) return 'Gambia';
    if (cleanPhone.startsWith('+221')) return 'Senegal';
    if (cleanPhone.startsWith('+222')) return 'Mauritania';
    if (cleanPhone.startsWith('+223')) return 'Mali';
    if (cleanPhone.startsWith('+224')) return 'Guinea';
    if (cleanPhone.startsWith('+225')) return 'Ivory Coast';
    if (cleanPhone.startsWith('+226')) return 'Burkina Faso';
    if (cleanPhone.startsWith('+227')) return 'Niger';
    if (cleanPhone.startsWith('+228')) return 'Togo';
    if (cleanPhone.startsWith('+229')) return 'Benin';
    if (cleanPhone.startsWith('+230')) return 'Mauritius';
    if (cleanPhone.startsWith('+231')) return 'Liberia';
    if (cleanPhone.startsWith('+232')) return 'Sierra Leone';
    if (cleanPhone.startsWith('+233')) return 'Ghana';
    if (cleanPhone.startsWith('+234')) return 'Nigeria';
    if (cleanPhone.startsWith('+235')) return 'Chad';
    if (cleanPhone.startsWith('+236')) return 'Central African Republic';
    if (cleanPhone.startsWith('+237')) return 'Cameroon';
    if (cleanPhone.startsWith('+238')) return 'Cape Verde';
    if (cleanPhone.startsWith('+239')) return 'Sao Tome and Principe';
    if (cleanPhone.startsWith('+240')) return 'Equatorial Guinea';
    if (cleanPhone.startsWith('+241')) return 'Gabon';
    if (cleanPhone.startsWith('+242')) return 'Republic of the Congo';
    if (cleanPhone.startsWith('+243')) return 'Democratic Republic of the Congo';
    if (cleanPhone.startsWith('+244')) return 'Angola';
    if (cleanPhone.startsWith('+245')) return 'Guinea-Bissau';
    if (cleanPhone.startsWith('+246')) return 'British Indian Ocean Territory';
    if (cleanPhone.startsWith('+248')) return 'Seychelles';
    if (cleanPhone.startsWith('+249')) return 'Sudan';
    if (cleanPhone.startsWith('+250')) return 'Rwanda';
    if (cleanPhone.startsWith('+251')) return 'Ethiopia';
    if (cleanPhone.startsWith('+252')) return 'Somalia';
    if (cleanPhone.startsWith('+253')) return 'Djibouti';
    if (cleanPhone.startsWith('+254')) return 'Kenya';
    if (cleanPhone.startsWith('+255')) return 'Tanzania';
    if (cleanPhone.startsWith('+256')) return 'Uganda';
    if (cleanPhone.startsWith('+257')) return 'Burundi';
    if (cleanPhone.startsWith('+258')) return 'Mozambique';
    if (cleanPhone.startsWith('+260')) return 'Zambia';
    if (cleanPhone.startsWith('+261')) return 'Madagascar';
    if (cleanPhone.startsWith('+262')) return 'Reunion';
    if (cleanPhone.startsWith('+263')) return 'Zimbabwe';
    if (cleanPhone.startsWith('+264')) return 'Namibia';
    if (cleanPhone.startsWith('+265')) return 'Malawi';
    if (cleanPhone.startsWith('+266')) return 'Lesotho';
    if (cleanPhone.startsWith('+267')) return 'Botswana';
    if (cleanPhone.startsWith('+268')) return 'Swaziland';
    if (cleanPhone.startsWith('+269')) return 'Comoros';
    if (cleanPhone.startsWith('+290')) return 'Saint Helena';
    if (cleanPhone.startsWith('+291')) return 'Eritrea';
    if (cleanPhone.startsWith('+297')) return 'Aruba';
    if (cleanPhone.startsWith('+298')) return 'Faroe Islands';
    if (cleanPhone.startsWith('+299')) return 'Greenland';
    if (cleanPhone.startsWith('+350')) return 'Gibraltar';
    if (cleanPhone.startsWith('+351')) return 'Portugal';
    if (cleanPhone.startsWith('+352')) return 'Luxembourg';
    if (cleanPhone.startsWith('+353')) return 'Ireland';
    if (cleanPhone.startsWith('+354')) return 'Iceland';
    if (cleanPhone.startsWith('+355')) return 'Albania';
    if (cleanPhone.startsWith('+356')) return 'Malta';
    if (cleanPhone.startsWith('+357')) return 'Cyprus';
    if (cleanPhone.startsWith('+358')) return 'Finland';
    if (cleanPhone.startsWith('+359')) return 'Bulgaria';
    if (cleanPhone.startsWith('+370')) return 'Lithuania';
    if (cleanPhone.startsWith('+371')) return 'Latvia';
    if (cleanPhone.startsWith('+372')) return 'Estonia';
    if (cleanPhone.startsWith('+373')) return 'Moldova';
    if (cleanPhone.startsWith('+374')) return 'Armenia';
    if (cleanPhone.startsWith('+375')) return 'Belarus';
    if (cleanPhone.startsWith('+376')) return 'Andorra';
    if (cleanPhone.startsWith('+377')) return 'Monaco';
    if (cleanPhone.startsWith('+378')) return 'San Marino';
    if (cleanPhone.startsWith('+380')) return 'Ukraine';
    if (cleanPhone.startsWith('+381')) return 'Serbia';
    if (cleanPhone.startsWith('+382')) return 'Montenegro';
    if (cleanPhone.startsWith('+383')) return 'Kosovo';
    if (cleanPhone.startsWith('+385')) return 'Croatia';
    if (cleanPhone.startsWith('+386')) return 'Slovenia';
    if (cleanPhone.startsWith('+387')) return 'Bosnia and Herzegovina';
    if (cleanPhone.startsWith('+389')) return 'North Macedonia';
    if (cleanPhone.startsWith('+420')) return 'Czech Republic';
    if (cleanPhone.startsWith('+421')) return 'Slovakia';
    if (cleanPhone.startsWith('+423')) return 'Liechtenstein';
    if (cleanPhone.startsWith('+500')) return 'Falkland Islands';
    if (cleanPhone.startsWith('+501')) return 'Belize';
    if (cleanPhone.startsWith('+502')) return 'Guatemala';
    if (cleanPhone.startsWith('+503')) return 'El Salvador';
    if (cleanPhone.startsWith('+504')) return 'Honduras';
    if (cleanPhone.startsWith('+505')) return 'Nicaragua';
    if (cleanPhone.startsWith('+506')) return 'Costa Rica';
    if (cleanPhone.startsWith('+507')) return 'Panama';
    if (cleanPhone.startsWith('+508')) return 'Saint Pierre and Miquelon';
    if (cleanPhone.startsWith('+509')) return 'Haiti';
    if (cleanPhone.startsWith('+590')) return 'Guadeloupe';
    if (cleanPhone.startsWith('+591')) return 'Bolivia';
    if (cleanPhone.startsWith('+592')) return 'Guyana';
    if (cleanPhone.startsWith('+593')) return 'Ecuador';
    if (cleanPhone.startsWith('+594')) return 'French Guiana';
    if (cleanPhone.startsWith('+595')) return 'Paraguay';
    if (cleanPhone.startsWith('+596')) return 'Martinique';
    if (cleanPhone.startsWith('+597')) return 'Suriname';
    if (cleanPhone.startsWith('+598')) return 'Uruguay';
    if (cleanPhone.startsWith('+599')) return 'Netherlands Antilles';
    if (cleanPhone.startsWith('+670')) return 'East Timor';
    if (cleanPhone.startsWith('+672')) return 'Australian External Territories';
    if (cleanPhone.startsWith('+673')) return 'Brunei';
    if (cleanPhone.startsWith('+674')) return 'Nauru';
    if (cleanPhone.startsWith('+675')) return 'Papua New Guinea';
    if (cleanPhone.startsWith('+676')) return 'Tonga';
    if (cleanPhone.startsWith('+677')) return 'Solomon Islands';
    if (cleanPhone.startsWith('+678')) return 'Vanuatu';
    if (cleanPhone.startsWith('+679')) return 'Fiji';
    if (cleanPhone.startsWith('+680')) return 'Palau';
    if (cleanPhone.startsWith('+681')) return 'Wallis and Futuna';
    if (cleanPhone.startsWith('+682')) return 'Cook Islands';
    if (cleanPhone.startsWith('+683')) return 'Niue';
    if (cleanPhone.startsWith('+684')) return 'American Samoa';
    if (cleanPhone.startsWith('+685')) return 'Samoa';
    if (cleanPhone.startsWith('+686')) return 'Kiribati';
    if (cleanPhone.startsWith('+687')) return 'New Caledonia';
    if (cleanPhone.startsWith('+688')) return 'Tuvalu';
    if (cleanPhone.startsWith('+689')) return 'French Polynesia';
    if (cleanPhone.startsWith('+690')) return 'Tokelau';
    if (cleanPhone.startsWith('+691')) return 'Micronesia';
    if (cleanPhone.startsWith('+692')) return 'Marshall Islands';
    if (cleanPhone.startsWith('+850')) return 'North Korea';
    if (cleanPhone.startsWith('+852')) return 'Hong Kong';
    if (cleanPhone.startsWith('+853')) return 'Macau';
    if (cleanPhone.startsWith('+855')) return 'Cambodia';
    if (cleanPhone.startsWith('+856')) return 'Laos';
    if (cleanPhone.startsWith('+880')) return 'Bangladesh';
    if (cleanPhone.startsWith('+886')) return 'Taiwan';
    if (cleanPhone.startsWith('+960')) return 'Maldives';
    if (cleanPhone.startsWith('+961')) return 'Lebanon';
    if (cleanPhone.startsWith('+962')) return 'Jordan';
    if (cleanPhone.startsWith('+963')) return 'Syria';
    if (cleanPhone.startsWith('+964')) return 'Iraq';
    if (cleanPhone.startsWith('+965')) return 'Kuwait';
    if (cleanPhone.startsWith('+966')) return 'Saudi Arabia';
    if (cleanPhone.startsWith('+967')) return 'Yemen';
    if (cleanPhone.startsWith('+968')) return 'Oman';
    if (cleanPhone.startsWith('+970')) return 'Palestine';
    if (cleanPhone.startsWith('+971')) return 'UAE';
    if (cleanPhone.startsWith('+972')) return 'Israel';
    if (cleanPhone.startsWith('+973')) return 'Bahrain';
    if (cleanPhone.startsWith('+974')) return 'Qatar';
    if (cleanPhone.startsWith('+975')) return 'Bhutan';
    if (cleanPhone.startsWith('+976')) return 'Mongolia';
    if (cleanPhone.startsWith('+977')) return 'Nepal';
    if (cleanPhone.startsWith('+992')) return 'Tajikistan';
    if (cleanPhone.startsWith('+993')) return 'Turkmenistan';
    if (cleanPhone.startsWith('+994')) return 'Azerbaijan';
    if (cleanPhone.startsWith('+995')) return 'Georgia';
    if (cleanPhone.startsWith('+996')) return 'Kyrgyzstan';
    if (cleanPhone.startsWith('+998')) return 'Uzbekistan';
    return '';
  };

  useEffect(() => {
    phoneRef.current?.focus();
    loadSheetNames();
  }, []);
  
  useEffect(() => {
    // Add F5 key listener for quick save
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F5') {
        e.preventDefault();
        handleSave();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [formData, leads, duplicateError]);

  const loadSheetNames = async () => {
    const sheets = await getSheetNames();
    setSheetNames(sheets);
  };

  const handleKeyDown = (e: React.KeyboardEvent, nextRef?: React.RefObject<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (e.key === 'Enter' && nextRef?.current) {
      e.preventDefault();
      nextRef.current.focus();
    }
  };

  const countryRef = useRef<HTMLInputElement>(null);
  const placeRef = useRef<HTMLInputElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const qualityRef = useRef<HTMLSelectElement>(null);
  const industryRef = useRef<HTMLInputElement>(null);
  const notesRef = useRef<HTMLTextAreaElement>(null);
  const statusRef = useRef<HTMLSelectElement>(null);
  const forwardedRef = useRef<HTMLSelectElement>(null);

  const checkDuplicate = (phone: string): boolean => {
    if (!phone || phone.length < 8) return false;
    const last8Digits = phone.replace(/[^0-9]/g, '').slice(-8);
    return leads.some(lead => {
      const leadLast8 = lead.phone.replace(/[^0-9]/g, '').slice(-8);
      return leadLast8 === last8Digits;
    });
  };

  const handleSave = () => {
    if (!formData.phone || formData.phone.trim() === '') {
      setDuplicateError('Phone number is required!');
      return;
    }
    
    if (checkDuplicate(formData.phone)) {
      setDuplicateError('A lead with the same last 8 digits already exists!');
      return;
    }
    setDuplicateError('');
    
    // Ensure phone number starts with + if it exists
    console.log('Original phone:', formData.phone);
    const phoneWithPlus = formData.phone && !formData.phone.startsWith('+') ? `+${formData.phone}` : formData.phone;
    console.log('Phone with plus:', phoneWithPlus);
    
    // Auto-generate SL No if empty
    const maxSlNo = leads.reduce((max, lead) => {
      const num = parseInt(lead.slNo) || 0;
      return num > max ? num : max;
    }, 0);
    const slNo = formData.slNo || (maxSlNo + 1).toString();
    
    const leadToSave = { ...formData, phone: phoneWithPlus, slNo };
    console.log('Lead to save:', leadToSave);
    
    onSave(leadToSave);
    // Reset form
    setFormData({
      id: `new-${Date.now()}`,
      uid: `uid-${Date.now()}`,
      dateTime: new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16),
      slNo: '',
      phone: '',
      country: '',
      place: '',
      name: '',
      leadQuality: 'TO BE RESPONDED',
      businessIndustry: '',
      specialNotes: '',
      currentStatus: LeadStatus.NEW,
      forwardedTo: '',
    });
    phoneRef.current?.focus();
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <h2 className="text-2xl font-bold text-slate-800">Add New Lead</h2>
      
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-800 mb-6">Lead Information</h3>
        
        <div className="space-y-6">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700 mb-2">Date & Time</label>
            <input
              type="datetime-local"
              value={formData.dateTime}
              onChange={(e) => setFormData({...formData, dateTime: e.target.value})}
              onKeyDown={(e) => handleKeyDown(e, phoneRef)}
              className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div className="space-y-1 relative">
            <label className="block text-sm font-medium text-slate-700 mb-2">Lead Mobile Number <span className="text-red-500">*</span></label>
            <input
              ref={phoneRef}
              type="tel"
              value={formData.phone}
              onChange={(e) => {
                const phone = e.target.value;
                const country = getCountryFromPhone(phone);
                setFormData({...formData, phone, country: country || formData.country});
                if (duplicateError) setDuplicateError('');
                
                // Filter existing numbers
                if (phone.length >= 1) {
                  console.log('Total leads:', leads.length);
                  console.log('Leads with phone:', leads.filter(l => l.phone).length);
                  console.log('Sample phone numbers:', leads.slice(0, 5).map(l => l.phone));
                  let filtered;
                  if (phone === '+') {
                    // Show all numbers when typing just + (since DB doesn't store +)
                    filtered = leads.filter(lead => 
                      lead.phone && typeof lead.phone === 'string'
                    ).slice(0, 10);
                  } else {
                    // Filter by what user typed
                    // Remove + from search since DB doesn't store it
                    const searchPhone = phone.replace('+', '');
                    filtered = leads.filter(lead => 
                      lead.phone && typeof lead.phone === 'string' && 
                      lead.phone.includes(searchPhone)
                    ).slice(0, 10);
                  }
                  console.log('Filtered results:', filtered.length);
                  setFilteredNumbers(filtered);
                  setShowSuggestions(filtered.length > 0);
                  
                  // Check for exact match
                  const exact = leads.find(lead => lead.phone === phone);
                  setExactMatch(exact || null);
                } else {
                  setShowSuggestions(false);
                  setFilteredNumbers([]);
                  setExactMatch(null);
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  setShowSuggestions(false);
                } else {
                  handleKeyDown(e, countryRef);
                }
              }}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              placeholder="Enter mobile number"
              className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${duplicateError ? 'border-red-500' : 'border-slate-300'}`}
            />
            {duplicateError && (
              <p className="text-red-500 text-sm mt-1">{duplicateError}</p>
            )}
            {exactMatch && (
              <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 font-medium text-sm mb-2">Lead already exists!</p>
                <div className="text-xs text-red-600">
                  <p><strong>Name:</strong> {exactMatch.name || 'N/A'}</p>
                  <p><strong>Country:</strong> {exactMatch.country}</p>
                  <p><strong>Status:</strong> {exactMatch.currentStatus}</p>
                  <p><strong>Assigned to:</strong> {exactMatch.forwardedTo || 'Not assigned'}</p>
                </div>
              </div>
            )}
            {showSuggestions && filteredNumbers.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-slate-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                {filteredNumbers.map((lead, index) => (
                  <div
                    key={index}
                    className="p-3 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-b-0"
                    onClick={() => {
                      setFormData({...formData, phone: lead.phone});
                      setShowSuggestions(false);
                    }}
                  >
                    <div className="font-medium text-sm">{lead.phone}</div>
                    <div className="text-xs text-slate-500">{lead.name || 'N/A'} - {lead.country}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700 mb-2">Country</label>
            <input
              ref={countryRef}
              type="text"
              value={formData.country}
              onChange={(e) => setFormData({...formData, country: e.target.value})}
              onKeyDown={(e) => handleKeyDown(e, placeRef)}
              className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter country"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700 mb-2">Place</label>
            <input
              ref={placeRef}
              type="text"
              value={formData.place}
              onChange={(e) => setFormData({...formData, place: e.target.value})}
              onKeyDown={(e) => handleKeyDown(e, nameRef)}
              className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter place"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700 mb-2">Name</label>
            <input
              ref={nameRef}
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              onKeyDown={(e) => handleKeyDown(e, qualityRef)}
              className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter name"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700 mb-2">Lead Quality</label>
            <select 
                ref={qualityRef}
                value={formData.leadQuality}
                onChange={(e) => setFormData({...formData, leadQuality: e.target.value})}
                onKeyDown={(e) => handleKeyDown(e, industryRef)}
                className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
                {(leadQualities || ['GENUINE', 'WARM', 'COLD', 'FAKE', 'UNCATEGORIZED']).map(c => (
                    <option key={c} value={c}>{c}</option>
                ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700 mb-2">Business Industry</label>
            <select
              ref={industryRef}
              value={formData.businessIndustry}
              onChange={(e) => setFormData({...formData, businessIndustry: e.target.value})}
              onKeyDown={(e) => handleKeyDown(e, notesRef)}
              className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Select industry...</option>
              {businessIndustries.map(industry => (
                <option key={industry} value={industry}>{industry}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700 mb-2">Special Notes</label>
            <textarea
              ref={notesRef}
              value={formData.specialNotes}
              onChange={(e) => setFormData({...formData, specialNotes: e.target.value})}
              onKeyDown={(e) => handleKeyDown(e, statusRef)}
              rows={3}
              className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
              placeholder="Enter special notes"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700 mb-2">Current Status</label>
            <select 
                ref={statusRef}
                value={formData.currentStatus}
                onChange={(e) => setFormData({...formData, currentStatus: e.target.value as LeadStatus})}
                onKeyDown={(e) => handleKeyDown(e, forwardedRef)}
                className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
                {Object.values(LeadStatus).map(s => (
                    <option key={s} value={s}>{s}</option>
                ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700 mb-2">Forwarded to</label>
            <select
              ref={forwardedRef}
              value={formData.forwardedTo}
              onChange={(e) => setFormData({...formData, forwardedTo: e.target.value})}
              className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Select sheet...</option>
              {sheetNames.map(sheet => (
                <option key={sheet} value={sheet}>{sheet}</option>
              ))}
            </select>
          </div>

          <div className="pt-6 border-t border-slate-200">
            <button
              onClick={handleSave}
              className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
            >
              Save Lead
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
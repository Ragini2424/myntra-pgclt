export interface IndianCity {
  name: string;
  state: string;
  region: string;
  tier: 'Tier 1' | 'Tier 2' | 'Tier 3';
  famousFor?: string;
  popularFestivals?: string[];
  hindiName?: string;
}

export const INDIAN_CITIES: IndianCity[] = [
  // PUNJAB & HARYANA
  { name: 'Amritsar', hindiName: 'अमृतसर', state: 'Punjab', region: 'North', tier: 'Tier 2', famousFor: 'Phulkari Suits, Patiala Salwars & Punjabi Juttis', popularFestivals: ['Baisakhi', 'Gurpurab', 'Lohri', 'Teej'] },
  { name: 'Ludhiana', hindiName: 'लुधियाना', state: 'Punjab', region: 'North', tier: 'Tier 1', famousFor: 'Rich Woolen Knitwear & Shaadi Sherwanis', popularFestivals: ['Lohri', 'Baisakhi', 'Teej'] },
  { name: 'Chandigarh', hindiName: 'चंडीगढ़', state: 'Punjab', region: 'North', tier: 'Tier 1', famousFor: 'Modern Punjabi Fusion & Royal Festive Suits', popularFestivals: ['Baisakhi', 'Teej'] },
  { name: 'Hoshiarpur', hindiName: 'होशियारपुर', state: 'Punjab', region: 'North', tier: 'Tier 3', famousFor: 'Wooden Inlay Handicrafts, Phulkari Dupattas & Juttis', popularFestivals: ['Baisakhi', 'Teej', 'Lohri'] },
  { name: 'Jalandhar', hindiName: 'जालंधर', state: 'Punjab', region: 'North', tier: 'Tier 2', famousFor: 'Designer Leather Footwear & Sports Wear', popularFestivals: ['Baisakhi', 'Lohri', 'Teej'] },
  { name: 'Patiala', hindiName: 'पटियाला', state: 'Punjab', region: 'North', tier: 'Tier 2', famousFor: 'Royal Patiala Shahi Turbans & Salwar Suits', popularFestivals: ['Baisakhi', 'Teej', 'Lohri'] },
  { name: 'Bathinda', hindiName: 'बठिंडा', state: 'Punjab', region: 'North', tier: 'Tier 3', famousFor: 'Traditional Handloom & Cotton Suits', popularFestivals: ['Baisakhi', 'Lohri'] },
  { name: 'Gurgaon', hindiName: 'गुरुग्राम', state: 'Haryana', region: 'North', tier: 'Tier 1', famousFor: 'Corporate Power Suits & Designer Indo-Western', popularFestivals: ['Diwali', 'Teej'] },
  { name: 'Faridabad', hindiName: 'फरीदाबाद', state: 'Haryana', region: 'North', tier: 'Tier 2', famousFor: 'Festive Wear & Modern Ethnic Suits', popularFestivals: ['Diwali', 'Dussehra'] },
  { name: 'Panipat', hindiName: 'पानीपत', state: 'Haryana', region: 'North', tier: 'Tier 2', famousFor: 'Handloom Weaves & Textile Hub Accessories', popularFestivals: ['Teej', 'Diwali'] },
  { name: 'Karnal', hindiName: 'करनाल', state: 'Haryana', region: 'North', tier: 'Tier 3', famousFor: 'Traditional Kurti Sets & Handloom', popularFestivals: ['Diwali', 'Teej'] },

  // RAJASTHAN
  { name: 'Jaipur', hindiName: 'जयपुर', state: 'Rajasthan', region: 'North', tier: 'Tier 1', famousFor: 'Bandhani, Gota Patti & Royal Lehengas', popularFestivals: ['Teej', 'Gangaur', 'Diwali'] },
  { name: 'Jodhpur', hindiName: 'जोधपुर', state: 'Rajasthan', region: 'North', tier: 'Tier 2', famousFor: 'Handcrafted Mojaris & Royal Jodhpuri Kurtas', popularFestivals: ['Marwar Festival', 'Diwali'] },
  { name: 'Udaipur', hindiName: 'उदयपुर', state: 'Rajasthan', region: 'North', tier: 'Tier 2', famousFor: 'Royal Wedding Couture & Mewari Silks', popularFestivals: ['Mewar Festival', 'Holi'] },
  { name: 'Kota', hindiName: 'कोटा', state: 'Rajasthan', region: 'North', tier: 'Tier 2', famousFor: 'Kota Doria Lightweight Zari Sarees', popularFestivals: ['Dussehra', 'Teej'] },
  { name: 'Ajmer', hindiName: 'अजमेर', state: 'Rajasthan', region: 'North', tier: 'Tier 2', famousFor: 'Traditional Dupattas & Dargah Festive Wear', popularFestivals: ['Urs', 'Diwali'] },
  { name: 'Bikaner', hindiName: 'बीकानेर', state: 'Rajasthan', region: 'North', tier: 'Tier 2', famousFor: 'Camel Leather Footwear & Bandhej Sarees', popularFestivals: ['Camel Festival', 'Diwali'] },

  // UTTAR PRADESH
  { name: 'Lucknow', hindiName: 'लखनऊ', state: 'Uttar Pradesh', region: 'North', tier: 'Tier 1', famousFor: 'Hand-Embroidered Chikankari & Zardozi Wear', popularFestivals: ['Lucknow Mahotsav', 'Eid', 'Diwali'] },
  { name: 'Varanasi', hindiName: 'वाराणसी', state: 'Uttar Pradesh', region: 'North', tier: 'Tier 2', famousFor: 'Pure Banarasi Silk Sarees & Temple Drapes', popularFestivals: ['Dev Deepawali', 'Mahashivratri'] },
  { name: 'Kanpur', hindiName: 'कानपुर', state: 'Uttar Pradesh', region: 'North', tier: 'Tier 1', famousFor: 'Genuine Leather Brogues & Craft Footwear', popularFestivals: ['Ganga Mela', 'Diwali'] },
  { name: 'Agra', hindiName: 'आगरा', state: 'Uttar Pradesh', region: 'North', tier: 'Tier 2', famousFor: 'Taj Heritage Zardozi & Festive Footwear', popularFestivals: ['Taj Mahotsav', 'Holi'] },
  { name: 'Noida', hindiName: 'नोएडा', state: 'Uttar Pradesh', region: 'North', tier: 'Tier 1', famousFor: 'Modern Ethnic & Corporate Fusion Wear', popularFestivals: ['Diwali', 'Dussehra'] },
  { name: 'Prayagraj', hindiName: 'प्रयागराज', state: 'Uttar Pradesh', region: 'North', tier: 'Tier 2', famousFor: 'Kumbh Handloom Drapes & Silk Sarees', popularFestivals: ['Kumbh Mela', 'Dev Deepawali'] },
  { name: 'Ghaziabad', hindiName: 'गाजियाबाद', state: 'Uttar Pradesh', region: 'North', tier: 'Tier 1', famousFor: 'NCR Festive Fashion & Kurti Sets', popularFestivals: ['Diwali', 'Dussehra'] },
  { name: 'Gorakhpur', hindiName: 'गोरखपुर', state: 'Uttar Pradesh', region: 'North', tier: 'Tier 2', famousFor: 'Terracotta Art & Traditional Handloom', popularFestivals: ['Makar Sankranti', 'Diwali'] },
  { name: 'Bareilly', hindiName: 'बरेली', state: 'Uttar Pradesh', region: 'North', tier: 'Tier 2', famousFor: 'Zardozi Embroidery & Festive Kurtis', popularFestivals: ['Diwali', 'Holi'] },
  { name: 'Meerut', hindiName: 'मेरठ', state: 'Uttar Pradesh', region: 'North', tier: 'Tier 2', famousFor: 'Handloom Weaves & Gold Jewelry', popularFestivals: ['Nauchandi Mela', 'Diwali'] },

  // BIHAR & JHARKHAND
  { name: 'Patna', hindiName: 'पटना', state: 'Bihar', region: 'East', tier: 'Tier 1', famousFor: 'Bhagalpuri Tussar Silk & Mithila Art Wear', popularFestivals: ['Chhath Puja', 'Saraswati Puja', 'Teej'] },
  { name: 'Gaya', hindiName: 'गया', state: 'Bihar', region: 'East', tier: 'Tier 2', famousFor: 'Traditional Handloom Cotton & Pitru Paksha Wear', popularFestivals: ['Pitru Paksha Mela', 'Chhath Puja'] },
  { name: 'Muzaffarpur', hindiName: 'मुजफ्फरपुर', state: 'Bihar', region: 'East', tier: 'Tier 2', famousFor: 'Shisha Mirror Work Kurtis & Festive Wear', popularFestivals: ['Chhath Puja', 'Durga Puja'] },
  { name: 'Bhagalpur', hindiName: 'भागलपुर', state: 'Bihar', region: 'East', tier: 'Tier 2', famousFor: 'World Famous Bhagalpuri Silk City Weaves', popularFestivals: ['Bihu Puja', 'Chhath Puja'] },
  { name: 'Darbhanga', hindiName: 'दरभंगा', state: 'Bihar', region: 'East', tier: 'Tier 2', famousFor: 'Mithila Handpainted Sarees & Traditional Wear', popularFestivals: ['Chhath Puja', 'Saraswati Puja'] },
  { name: 'Purnia', hindiName: 'पूर्णिया', state: 'Bihar', region: 'East', tier: 'Tier 3', famousFor: 'Hand woven Jute Blend Fabric & Festive Wear', popularFestivals: ['Chhath Puja', 'Durga Puja'] },
  { name: 'Ranchi', hindiName: 'रांची', state: 'Jharkhand', region: 'East', tier: 'Tier 2', famousFor: 'Tussar Handloom Sarees & Youth Streetwear', popularFestivals: ['Sarhul', 'Chhath Puja'] },
  { name: 'Jamshedpur', hindiName: 'जमशेदपुर', state: 'Jharkhand', region: 'East', tier: 'Tier 1', famousFor: 'Steel City Modern Fusion & Ethnic wear', popularFestivals: ['Durga Puja', 'Diwali'] },
  { name: 'Dhanbad', hindiName: 'धनबाद', state: 'Jharkhand', region: 'East', tier: 'Tier 2', famousFor: 'Festive Cotton Sarees & Casual Wear', popularFestivals: ['Chhath Puja', 'Durga Puja'] },

  // MAHARASHTRA & GOA
  { name: 'Mumbai', hindiName: 'मुंबई', state: 'Maharashtra', region: 'West', tier: 'Tier 1', famousFor: 'High Fashion, Bollywood Glam & Paithani Silks', popularFestivals: ['Ganesh Chaturthi', 'Diwali'] },
  { name: 'Pune', hindiName: 'पुणे', state: 'Maharashtra', region: 'West', tier: 'Tier 1', famousFor: 'Nauvari Sarees, Peshwai Kurtas & Kolhapuris', popularFestivals: ['Ganeshotsav', 'Gudi Padwa'] },
  { name: 'Nagpur', hindiName: 'नागपुर', state: 'Maharashtra', region: 'West', tier: 'Tier 1', famousFor: 'Festive Silk Handlooms & Kolhapuri Wedges', popularFestivals: ['Marbat', 'Diwali'] },
  { name: 'Kolhapur', hindiName: 'कोल्हापुर', state: 'Maharashtra', region: 'West', tier: 'Tier 2', famousFor: 'Authentic Handcrafted Leather Kolhapuri Chappals', popularFestivals: ['Ganesh Utsav', 'Navratri'] },
  { name: 'Nashik', hindiName: 'नाशिक', state: 'Maharashtra', region: 'West', tier: 'Tier 2', famousFor: 'Grape County Silk Drapes & Festive Ethnic Wear', popularFestivals: ['Kumbh Mela', 'Ganesh Utsav'] },
  { name: 'Thane', hindiName: 'ठाणे', state: 'Maharashtra', region: 'West', tier: 'Tier 1', famousFor: 'Lakeside Fusion Fashion & Festive Kurtis', popularFestivals: ['Ganesh Chaturthi', 'Diwali'] },
  { name: 'Panaji', hindiName: 'पणजी', state: 'Goa', region: 'West', tier: 'Tier 2', famousFor: 'Resort Wear, Coastal Linen & Shigmo Festive Attire', popularFestivals: ['Goa Carnival', 'Shigmo'] },

  // WEST BENGAL & EAST
  { name: 'Kolkata', hindiName: 'कोलकाता', state: 'West Bengal', region: 'East', tier: 'Tier 1', famousFor: 'Garad, Jamdani & Taant Silk Puja Sarees', popularFestivals: ['Durga Puja', 'Poila Baisakh'] },
  { name: 'Siliguri', hindiName: 'सिलीगुड़ी', state: 'West Bengal', region: 'East', tier: 'Tier 2', famousFor: 'Darjeeling Handloom Shawls & Festive Wear', popularFestivals: ['Durga Puja', 'Teesta Festival'] },
  { name: 'Howrah', hindiName: 'हावड़ा', state: 'West Bengal', region: 'East', tier: 'Tier 1', famousFor: 'Heritage Cotton Handloom & Zari Sarees', popularFestivals: ['Durga Puja', 'Kali Puja'] },
  { name: 'Durgapur', hindiName: 'दुर्गापुर', state: 'West Bengal', region: 'East', tier: 'Tier 2', famousFor: 'Kantha Stitch Embroidery & Silk Wear', popularFestivals: ['Durga Puja', 'Poila Baisakh'] },
  { name: 'Asansol', hindiName: 'आसानसोल', state: 'West Bengal', region: 'East', tier: 'Tier 2', famousFor: 'Traditional Handloom Cotton & Silk Drapes', popularFestivals: ['Durga Puja', 'Diwali'] },

  // DELHI NCR
  { name: 'Delhi', hindiName: 'दिल्ली', state: 'Delhi', region: 'North', tier: 'Tier 1', famousFor: 'Grand Shaadi Couture, Chandni Chowk Ethnic Wear', popularFestivals: ['Diwali', 'Dussehra', 'Holi'] },

  // KARNATAKA, TAMIL NADU & KERALA
  { name: 'Bengaluru', hindiName: 'बेंगलुरु', state: 'Karnataka', region: 'South', tier: 'Tier 1', famousFor: 'Mysore Silk Sarees & Tech Park Smart Casuals', popularFestivals: ['Karaga', 'Dasara', 'Ugadi'] },
  { name: 'Mysore', hindiName: 'मैसूर', state: 'Karnataka', region: 'South', tier: 'Tier 2', famousFor: 'Royal Mysore Gold-Zari Pure Silk Sarees', popularFestivals: ['Mysore Dasara', 'Ugadi'] },
  { name: 'Hubli', hindiName: 'हुबली', state: 'Karnataka', region: 'South', tier: 'Tier 2', famousFor: 'Kasuti Hand Embroidered Sarees', popularFestivals: ['Ganesh Chaturthi', 'Ugadi'] },
  { name: 'Mangalore', hindiName: 'मंगलुरु', state: 'Karnataka', region: 'South', tier: 'Tier 2', famousFor: 'Coastal Silk Sarees & Gold Accessories', popularFestivals: ['Kudroli Dasara', 'Ugadi'] },
  { name: 'Chennai', hindiName: 'चेन्नई', state: 'Tamil Nadu', region: 'South', tier: 'Tier 1', famousFor: 'Kanchipuram Temple Silk Sarees & Veshti Sets', popularFestivals: ['Pongal', 'Margazhi Festival'] },
  { name: 'Madurai', hindiName: 'मधुरै', state: 'Tamil Nadu', region: 'South', tier: 'Tier 2', famousFor: 'Sungudi Cotton Sarees & Pattu Pavadai Sets', popularFestivals: ['Chithirai Festival', 'Pongal'] },
  { name: 'Coimbatore', hindiName: 'कोयंबटूर', state: 'Tamil Nadu', region: 'South', tier: 'Tier 1', famousFor: 'Soft Silk Cotton Handloom Sarees', popularFestivals: ['Pongal', 'Mariamman Kovil'] },
  { name: 'Kochi', hindiName: 'कोच्चि', state: 'Kerala', region: 'South', tier: 'Tier 2', famousFor: 'Kasavu Golden Border Sarees & Handwoven Mundu', popularFestivals: ['Onam', 'Vishu'] },
  { name: 'Thiruvananthapuram', hindiName: 'तिरुवनंतपुरम', state: 'Kerala', region: 'South', tier: 'Tier 2', famousFor: 'Royal Travancore Handlooms & Kasavu Wear', popularFestivals: ['Attukal Pongala', 'Onam'] },

  // GUJARAT
  { name: 'Ahmedabad', hindiName: 'अहमदाबाद', state: 'Gujarat', region: 'West', tier: 'Tier 1', famousFor: 'Bandhani Tie-Dye, Patola Silks & Garba Chaniyas', popularFestivals: ['Navratri Garba', 'Uttarayan'] },
  { name: 'Surat', hindiName: 'सूरज', state: 'Gujarat', region: 'West', tier: 'Tier 1', famousFor: 'Textile Hub Designer Sarees & Zari Lehengas', popularFestivals: ['Navratri', 'Diwali'] },
  { name: 'Vadodara', hindiName: 'वडोदरा', state: 'Gujarat', region: 'West', tier: 'Tier 2', famousFor: 'Cultural Heritage Garba Ensembles & Mirror Wear', popularFestivals: ['Navratri', 'Uttrayan'] },
  { name: 'Rajkot', hindiName: 'राजकोट', state: 'Gujarat', region: 'West', tier: 'Tier 2', famousFor: 'Single Patola Weaves & Gold Jewelry Accessories', popularFestivals: ['Janmashtami', 'Navratri'] },

  // TELANGANA & ANDHRA PRADESH
  { name: 'Hyderabad', hindiName: 'हैदराबाद', state: 'Telangana', region: 'South', tier: 'Tier 1', famousFor: 'Pochampally Ikat Silks & Nizam Zari Sherwanis', popularFestivals: ['Bathukamma', 'Bonalu', 'Eid'] },
  { name: 'Visakhapatnam', hindiName: 'विशाखापटनम', state: 'Andhra Pradesh', region: 'South', tier: 'Tier 2', famousFor: 'Dharmavaram & Uppada Silk Sarees', popularFestivals: ['Sankranti', 'Ugadi'] },
  { name: 'Vijayawada', hindiName: 'विजयवाड़ा', state: 'Andhra Pradesh', region: 'South', tier: 'Tier 2', famousFor: 'Mangalagiri Cotton Handlooms', popularFestivals: ['Dasara', 'Sankranti'] },

  // ASSAM & NORTH-EAST
  { name: 'Guwahati', hindiName: 'गुवाहाटी', state: 'Assam', region: 'North-East', tier: 'Tier 2', famousFor: 'Golden Muga Silk Mekhela Chadors & Bihu Wear', popularFestivals: ['Rongali Bihu', 'Ambubachi Mela'] },
  { name: 'Shillong', hindiName: 'शिलांग', state: 'Meghalaya', region: 'North-East', tier: 'Tier 2', famousFor: 'Eri Silk Shawls & Youth Streetwear', popularFestivals: ['Shad Suk Mynsiem', 'Autumn Festival'] },
  { name: 'Imphal', hindiName: 'इम्फाल', state: 'Manipur', region: 'North-East', tier: 'Tier 2', famousFor: 'Innaphi Handloom Drapes & Phanek Weaves', popularFestivals: ['Yaoshang', 'Ningol Chakouba'] },
  { name: 'Agartala', hindiName: 'अगरतला', state: 'Tripura', region: 'North-East', tier: 'Tier 2', famousFor: 'Pachra Handloom & Bamboo Art Fashion', popularFestivals: ['Kharchi Puja', 'Garia Puja'] },

  // MADHYA PRADESH & CHHATTISGARH
  { name: 'Indore', hindiName: 'इंदौर', state: 'Madhya Pradesh', region: 'Central', tier: 'Tier 1', famousFor: 'Maheshwari & Chanderi Silk Cotton Sarees', popularFestivals: ['Ganesh Utsav', 'Rang Panchami'] },
  { name: 'Bhopal', hindiName: 'भोपाल', state: 'Madhya Pradesh', region: 'Central', tier: 'Tier 2', famousFor: 'Zardozi Embroidery & Traditional Kurtis', popularFestivals: ['Lokrang', 'Diwali'] },
  { name: 'Gwalior', hindiName: 'ग्वालियर', state: 'Madhya Pradesh', region: 'Central', tier: 'Tier 2', famousFor: 'Chanderi Handloom Weaves & Heritage Wear', popularFestivals: ['Tansen Music Festival', 'Diwali'] },
  { name: 'Raipur', hindiName: 'रायपुर', state: 'Chhattisgarh', region: 'Central', tier: 'Tier 2', famousFor: 'Kosa Silk Sarees & Tribal Art Wear', popularFestivals: ['Bastar Dussehra', 'Rajim Kumbh'] },

  // ODISHA
  { name: 'Bhubaneswar', hindiName: 'भुवनेश्वर', state: 'Odisha', region: 'East', tier: 'Tier 2', famousFor: 'Sambalpuri Ikat Sarees & Pasapalli Handlooms', popularFestivals: ['Ratha Yatra', 'Raja Festival'] },
  { name: 'Cuttack', hindiName: 'कटक', state: 'Odisha', region: 'East', tier: 'Tier 2', famousFor: 'Silver Filigree Accessories & Handloom Sarees', popularFestivals: ['Bali Jatra', 'Durga Puja'] },

  // HIMACHAL, UTTARAKHAND, JAMMU & KASHMIR
  { name: 'Shimla', hindiName: 'शिमला', state: 'Himachal Pradesh', region: 'North', tier: 'Tier 3', famousFor: 'Pashmina Shawls, Himachali Caps & Woolens', popularFestivals: ['Summer Festival', 'Diwali'] },
  { name: 'Dehradun', hindiName: 'देहरादून', state: 'Uttarakhand', region: 'North', tier: 'Tier 2', famousFor: 'Garhwali Woolens & Woolen Handlooms', popularFestivals: ['Phool Dei', 'Nanda Devi Raj Jat'] },
  { name: 'Srinagar', hindiName: 'श्रीनगर', state: 'Jammu & Kashmir', region: 'North', tier: 'Tier 2', famousFor: 'Pashmina Stoles, Kashmiri Tilla Embroidery & Pathani Suits', popularFestivals: ['Tulip Festival', 'Eid'] },
  { name: 'Jammu', hindiName: 'जम्मू', state: 'Jammu & Kashmir', region: 'North', tier: 'Tier 2', famousFor: 'Traditional Dogra Ethnic Wear & Woolens', popularFestivals: ['Navratri', 'Baisakhi'] }
];

export function searchIndianCities(query: string): IndianCity[] {
  const q = query.trim().toLowerCase();
  if (!q) return INDIAN_CITIES.slice(0, 12);

  return INDIAN_CITIES
    .map(c => {
      let score = 0;
      const cityNameL = c.name.toLowerCase();
      const stateNameL = c.state.toLowerCase();
      const hindiNameL = c.hindiName ? c.hindiName.toLowerCase() : '';

      if (cityNameL === q || hindiNameL === q) score += 100;
      else if (cityNameL.startsWith(q) || hindiNameL.startsWith(q)) score += 60;
      else if (cityNameL.includes(q) || hindiNameL.includes(q)) score += 30;

      if (stateNameL === q) score += 40;
      else if (stateNameL.startsWith(q)) score += 20;
      else if (stateNameL.includes(q)) score += 10;

      if (c.famousFor && c.famousFor.toLowerCase().includes(q)) score += 5;

      return { city: c, score };
    })
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(item => item.city)
    .slice(0, 20);
}

import { HotelOffer, Bank } from '@/types';

export const banks: Bank[] = [
  { id: 1, name: 'Commercial Bank', logoUrl: '/images/banks/commercial-bank.png' },
  { id: 2, name: 'Peoples Bank', logoUrl: '/images/banks/peoples-bank.png' },
  { id: 3, name: 'Sampath Bank', logoUrl: '/images/banks/sampath-bank.png' },
  { id: 4, name: 'HNB', logoUrl: '/images/banks/hnb.png' },
  { id: 5, name: 'DFCC Bank', logoUrl: '/images/banks/dfcc-bank.png' },
  { id: 6, name: 'NTB', logoUrl: '/images/banks/ntb.png' },
];

export const countries = ['Sri Lanka', 'India', 'Maldives', 'Thailand'];

export const provinces = [
  'Western Province',
  'Central Province',
  'Southern Province',
  'Northern Province',
  'Eastern Province',
  'North Western Province',
  'North Central Province',
  'Uva Province',
  'Sabaragamuwa Province',
];

export const districts = {
  'Western Province': ['Colombo', 'Gampaha', 'Kalutara'],
  'Central Province': ['Kandy', 'Matale', 'Nuwara Eliya'],
  'Southern Province': ['Galle', 'Matara', 'Hambantota'],
  'Northern Province': ['Jaffna', 'Kilinochchi', 'Mannar', 'Vavuniya', 'Mullaitivu'],
  'Eastern Province': ['Batticaloa', 'Ampara', 'Trincomalee'],
  'North Western Province': ['Kurunegala', 'Puttalam'],
  'North Central Province': ['Anuradhapura', 'Polonnaruwa'],
  'Uva Province': ['Badulla', 'Monaragala'],
  'Sabaragamuwa Province': ['Ratnapura', 'Kegalle'],
};

export const cities = {
  'Colombo': ['Colombo 01', 'Colombo 02', 'Colombo 03', 'Colombo 04', 'Colombo 05', 'Colombo 06', 'Colombo 07', 'Colombo 08', 'Colombo 09', 'Colombo 10', 'Colombo 11', 'Colombo 12', 'Colombo 13', 'Colombo 14', 'Colombo 15'],
  'Gampaha': ['Negombo', 'Wattala', 'Ja-Ela', 'Katunayake', 'Seeduwa'],
  'Kalutara': ['Kalutara', 'Panadura', 'Horana', 'Bandaragama'],
  'Kandy': ['Kandy', 'Peradeniya', 'Kundasale', 'Akurana'],
  'Matale': ['Matale', 'Dambulla', 'Galewela'],
  'Nuwara Eliya': ['Nuwara Eliya', 'Hatton', 'Dickoya', 'Talawakele'],
  'Galle': ['Galle', 'Ambalangoda', 'Hikkaduwa', 'Unawatuna'],
  'Matara': ['Matara', 'Weligama', 'Dikwella', 'Tangalle'],
  'Hambantota': ['Hambantota', 'Tissamaharama', 'Bundala'],
};

export const mockHotelOffers: HotelOffer[] = [
  {
    id: 1,
    hotelName: 'Cinnamon Grand Colombo',
    description: 'Luxury 5-star hotel in the heart of Colombo with world-class amenities and dining options.',
    location: {
      country: 'Sri Lanka',
      province: 'Western Province',
      district: 'Colombo',
      city: 'Colombo 03'
    },
    bank: banks[0],
    cardType: 'CREDIT',
    discount: 25,
    validFrom: '2024-01-01',
    validTo: '2024-12-31',
    terms: 'Minimum 2 nights stay required. Subject to availability.',
    imageUrl: '/images/hotels/cinnamon-grand.jpg',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 2,
    hotelName: 'Shangri-La Colombo',
    description: 'Premium waterfront hotel offering stunning ocean views and exceptional service.',
    location: {
      country: 'Sri Lanka',
      province: 'Western Province',
      district: 'Colombo',
      city: 'Colombo 01'
    },
    bank: banks[1],
    cardType: 'DEBIT',
    discount: 20,
    validFrom: '2024-02-01',
    validTo: '2024-11-30',
    terms: 'Valid for weekend stays only. Cannot be combined with other offers.',
    imageUrl: '/images/hotels/shangri-la.jpg',
    isActive: true,
    createdAt: '2024-02-01T00:00:00Z',
    updatedAt: '2024-02-01T00:00:00Z',
  },
  {
    id: 3,
    hotelName: 'Heritance Kandalama',
    description: 'Eco-friendly resort nestled in the cultural triangle with breathtaking views.',
    location: {
      country: 'Sri Lanka',
      province: 'Central Province',
      district: 'Matale',
      city: 'Dambulla'
    },
    bank: banks[2],
    cardType: 'CREDIT',
    discount: 30,
    validFrom: '2024-03-01',
    validTo: '2024-10-31',
    terms: 'Minimum 3 nights stay. Includes breakfast and one dinner.',
    imageUrl: '/images/hotels/heritance-kandalama.jpg',
    isActive: true,
    createdAt: '2024-03-01T00:00:00Z',
    updatedAt: '2024-03-01T00:00:00Z',
  },
  {
    id: 4,
    hotelName: 'Jetwing Lighthouse',
    description: 'Historic hotel in Galle Fort with colonial charm and modern luxury.',
    location: {
      country: 'Sri Lanka',
      province: 'Southern Province',
      district: 'Galle',
      city: 'Galle'
    },
    bank: banks[3],
    cardType: 'DEBIT',
    discount: 15,
    validFrom: '2024-04-01',
    validTo: '2024-09-30',
    terms: 'Valid for weekday stays. Early bird booking required.',
    imageUrl: '/images/hotels/jetwing-lighthouse.jpg',
    isActive: true,
    createdAt: '2024-04-01T00:00:00Z',
    updatedAt: '2024-04-01T00:00:00Z',
  },
  {
    id: 5,
    hotelName: 'Araliya Green Hills',
    description: 'Mountain resort in Nuwara Eliya with cool climate and scenic tea plantations.',
    location: {
      country: 'Sri Lanka',
      province: 'Central Province',
      district: 'Nuwara Eliya',
      city: 'Nuwara Eliya'
    },
    bank: banks[4],
    cardType: 'CREDIT',
    discount: 35,
    validFrom: '2024-05-01',
    validTo: '2024-08-31',
    terms: 'Peak season rates apply. Includes afternoon tea service.',
    imageUrl: '/images/hotels/araliya-green-hills.jpg',
    isActive: true,
    createdAt: '2024-05-01T00:00:00Z',
    updatedAt: '2024-05-01T00:00:00Z',
  },
];

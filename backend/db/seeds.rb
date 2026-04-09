# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).
#
# Example:
#
#   ["Action", "Comedy", "Drama", "Horror"].each do |genre_name|
#     MovieGenre.find_or_create_by!(name: genre_name)
#   end

# db/seeds.rb
# Clear existing data
puts "Seeding database..."
WatchlistItem.delete_all
Property.delete_all
# User.delete_all

# ── Users ───────────────────────────────────────────────────────────────────

demo_user = User.create!(
  email:      "jane@yahoo.com",
  password:   "password123",
  first_name: "Alex",
  last_name:  "Rivera"
)
puts "Created demo user: #{demo_user.email}"

# ── Properties ──────────────────────────────────────────────────────────────

PROPERTY_IMAGES = {
  house: [
    "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800",
    "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800",
    "https://images.unsplash.com/photo-1572120360610-d971b9d7767c?w=800",
    "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800",
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800"
  ],
  apartment: [
    "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800",
    "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800",
    "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800",
    "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800"
  ],
  townhouse: [
    "https://images.unsplash.com/photo-1605146769289-440113cc3d00?w=800",
    "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800"
  ],
  condo: [
    "https://images.unsplash.com/photo-1574362848149-11496d93a7c7?w=800",
    "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800"
  ]
}.freeze

CITIES = [
  { city: "Makati",      state: "Metro Manila" },
  { city: "Taguig",      state: "Metro Manila" },
  { city: "Quezon City", state: "Metro Manila" },
  { city: "Davao City",  state: "Davao del Sur" },
  { city: "Cebu City",   state: "Cebu" },
  { city: "Danao City",  state: "Cebu" },
  { city: "Lapu-Lapu",   state: "Cebu" },
  { city: "Mandaue",     state: "Cebu" },
  { city: "Talisay",     state: "Cebu" },
  { city: "Minglanilla", state: "Cebu" },
  { city: "Pasig",       state: "Metro Manila" }
].freeze

AMENITIES = %w[Pool Gym Security Balcony Garden Parking WiFi Elevator Concierge].freeze

properties_data = [
  # Featured luxury properties
  { title: "Modern Hillside Villa", type: "house",     bedrooms: 5, bathrooms: 4, price: 45_000_000, area: 450, featured: true },
  { title: "BGC Penthouse Suite",   type: "condo",     bedrooms: 3, bathrooms: 3, price: 28_000_000, area: 220, featured: true },
  { title: "Seaside Family Home",   type: "house",     bedrooms: 4, bathrooms: 3, price: 18_500_000, area: 320, featured: true },

  # Regular listings - mix of types, prices, bedrooms
  { title: "Cozy Studio Apartment",       type: "apartment", bedrooms: 0, bathrooms: 1, price: 2_800_000,  area: 35  },
  { title: "Executive 1BR Condo",         type: "condo",     bedrooms: 1, bathrooms: 1, price: 5_500_000,  area: 55  },
  { title: "Spacious 2BR Apartment",      type: "apartment", bedrooms: 2, bathrooms: 1, price: 7_200_000,  area: 80  },
  { title: "Corner Townhouse Unit",       type: "townhouse", bedrooms: 3, bathrooms: 2, price: 9_800_000,  area: 140 },
  { title: "Garden Bungalow",             type: "house",     bedrooms: 3, bathrooms: 2, price: 12_000_000, area: 200 },
  { title: "IT Park Loft Studio",         type: "apartment", bedrooms: 0, bathrooms: 1, price: 3_500_000,  area: 40  },
  { title: "Family Townhouse",            type: "townhouse", bedrooms: 4, bathrooms: 3, price: 14_500_000, area: 180 },
  { title: "Affordable 1BR Unit",         type: "apartment", bedrooms: 1, bathrooms: 1, price: 4_200_000,  area: 48  },
  { title: "Heritage District Home",      type: "house",     bedrooms: 5, bathrooms: 3, price: 22_000_000, area: 380 },
  { title: "Mid-Rise 2BR Condo",          type: "condo",     bedrooms: 2, bathrooms: 2, price: 11_000_000, area: 90  },
  { title: "Beachfront Property",         type: "house",     bedrooms: 4, bathrooms: 4, price: 35_000_000, area: 400 },
  { title: "City View Studio",            type: "condo",     bedrooms: 0, bathrooms: 1, price: 4_800_000,  area: 42  },
  { title: "Suburban Family House",       type: "house",     bedrooms: 4, bathrooms: 3, price: 15_000_000, area: 260 },
  { title: "Budget-Friendly Apartment",   type: "apartment", bedrooms: 1, bathrooms: 1, price: 2_500_000,  area: 32  },
  { title: "Premium Townhouse Corner",    type: "townhouse", bedrooms: 3, bathrooms: 3, price: 16_000_000, area: 195 },
  { title: "Highrise Condo 3BR",          type: "condo",     bedrooms: 3, bathrooms: 2, price: 19_500_000, area: 135 },
  { title: "Developer's House",           type: "house",     bedrooms: 3, bathrooms: 2, price: 8_900_000,  area: 150 },
  { title: "Investment Studio Unit",      type: "apartment", bedrooms: 0, bathrooms: 1, price: 3_100_000,  area: 38  },
  { title: "Lakeside Manor",              type: "house",     bedrooms: 6, bathrooms: 5, price: 55_000_000, area: 600 },
  { title: "Downtown 2BR Apartment",      type: "apartment", bedrooms: 2, bathrooms: 2, price: 8_500_000,  area: 85  },
  { title: "Gated Community House",       type: "house",     bedrooms: 4, bathrooms: 3, price: 20_000_000, area: 300 },
  { title: "First-time Buyer's Condo",    type: "condo",     bedrooms: 1, bathrooms: 1, price: 6_300_000,  area: 62  },
  { title: "Panoramic View Penthouse",    type: "condo",     bedrooms: 4, bathrooms: 3, price: 38_000_000, area: 280 },

  { title: "Mivesa Studio Apartment",    type: "apartment", bedrooms: 0, bathrooms: 1, price: 2_800_000,area: 35  },
  { title: "Plumera 1BR Condo",           type: "condo",     bedrooms: 1, bathrooms: 1, price: 5_500_000,  area: 55  },
  { title: "Casa Mira 2BR Apartment",     type: "apartment", bedrooms: 2, bathrooms: 1, price: 7_200_000,  area: 80  },
  { title: "Deca Townhouse Unit",         type: "townhouse", bedrooms: 3, bathrooms: 2, price: 9_800_000,  area: 140 },
  { title: "Blue Garden Bungalow",        type: "house",     bedrooms: 3, bathrooms: 2, price: 12_000_000, area: 200 },
  { title: "CBP Park Loft Studio",        type: "apartment", bedrooms: 0, bathrooms: 1, price: 3_500_000,  area: 40  },
  { title: "Family Townhouse II",         type: "townhouse", bedrooms: 4, bathrooms: 3, price: 14_500_000, area: 180 },
  { title: "Saekyung 1BR Unit",           type: "apartment", bedrooms: 1, bathrooms: 1, price: 4_200_000,  area: 48  },
  { title: "Grand Heritage District Home",type: "house",     bedrooms: 5, bathrooms: 3, price: 22_000_000, area: 380 },
  { title: "Mid-Rise 2BR Condo II",       type: "condo",     bedrooms: 2, bathrooms: 2, price: 11_000_000, area: 90  },
  { title: "Beachfront Property",         type: "house",     bedrooms: 4, bathrooms: 4, price: 35_000_000, area: 400 },
  { title: "Loft City View Studio",       type: "condo",     bedrooms: 0, bathrooms: 1, price: 4_800_000,  area: 42  },
  { title: "Suburban Family House II",    type: "house",     bedrooms: 4, bathrooms: 3, price: 15_000_000, area: 260 },
  { title: "Budget-Friendly Apartment II",type: "apartment", bedrooms: 1, bathrooms: 1, price: 2_500_000,  area: 32  },
  { title: "Symfony Townhouse Corner",    type: "townhouse", bedrooms: 3, bathrooms: 3, price: 16_000_000, area: 195 },
  { title: "IT Park Highrise Condo 3BR",  type: "condo",     bedrooms: 3, bathrooms: 2, price: 19_500_000, area: 135 },
  { title: "Developer's House",           type: "house",     bedrooms: 3, bathrooms: 2, price: 8_900_000,  area: 150 },
  { title: "Investment Studio Unit",      type: "apartment", bedrooms: 0, bathrooms: 1, price: 3_100_000,  area: 38  },
  { title: "Lakeside QL Manor",           type: "house",     bedrooms: 6, bathrooms: 5, price: 55_000_000, area: 600 },
  { title: "Colon Downtown 2BR Apartment",type: "apartment", bedrooms: 2, bathrooms: 2, price: 8_500_000,  area: 85  },
  { title: "StarGated Community House",   type: "house",     bedrooms: 4, bathrooms: 3, price: 20_000_000, area: 300 },
  { title: "First-time Buyer's Condo II", type: "condo",     bedrooms: 1, bathrooms: 1, price: 6_300_000,  area: 62  },
  { title: "Panoramic View Penthouse II", type: "condo",     bedrooms: 4, bathrooms: 3, price: 38_000_000, area: 280 }
]

properties_data.each_with_index do |data, i|
  city_data = CITIES[i % CITIES.length]
  images    = PROPERTY_IMAGES[data[:type].to_sym] || PROPERTY_IMAGES[:house]
  amenities = AMENITIES.sample(rand(3..7))

  Property.create!(
    title:             data[:title],
    description:       "Beautiful #{data[:type]} in #{city_data[:city]}. This property features #{data[:bedrooms]} bedroom(s) and #{data[:bathrooms]} bathroom(s). Ideal for families and investors looking for quality housing in a prime location.",
    property_type:     data[:type],
    status:            "active",
    price:             data[:price],
    bedrooms:          data[:bedrooms],
    bathrooms:         data[:bathrooms],
    area_sqm:          data[:area],
    parking_spaces:    [ 0, 1, 2 ].sample,
    is_featured:       data[:featured] || false,
    address:           "#{rand(1..999)} #{%w[Mango Ayala Osmeña Colon Fuente].sample} #{%w[Street Avenue Boulevard Drive].sample}",
    city:              city_data[:city],
    state:             city_data[:state],
    country:           "Philippines",
    primary_image_url: images.sample,
    images:            images.sample(rand(2..4)),
    amenities:         amenities
  )
end

puts "Created #{Property.count} properties"

# Add some to demo user's watchlist
Property.first(3).each do |p|
  WatchlistItem.create!(user: demo_user, property: p)
end

puts "Added #{WatchlistItem.count} items to demo watchlist"
puts "\nSeed complete! Demo credentials: demo@landchecker.com / password123"

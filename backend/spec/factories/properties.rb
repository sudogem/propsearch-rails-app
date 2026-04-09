# spec/factories/properties.rb
require "faker"
require "rails_helper"

FactoryBot.define do
  factory :property do
    title         { Faker::Name.name + " " + Faker::House.room }
    description   { Faker::Lorem.paragraph(sentence_count: 4) }
    property_type { Property::PROPERTY_TYPES.sample }
    status        { "active" }
    price         { Faker::Number.between(from: 1_000_000, to: 50_000_000) }
    bedrooms      { rand(0..5) }
    bathrooms     { rand(1..4) }
    area_sqm      { rand(30..500) }
    address       { Faker::Address.street_address }
    city          { "Cebu City" }
    state         { "Cebu" }
    country       { "Philippines" }
  end
end

# spec/requests/api/v1/properties_spec.rb
require "rails_helper"

RSpec.describe "Api::V1::Properties", type: :request do
  let!(:user)       { create(:user) }
  let!(:properties) { create_list(:property, 15, status: "active") }
  let(:auth_headers) do
    token = JwtService.encode(user_id: user.id)
    { "Authorization" => "Bearer #{token}" }
  end

  describe "GET /api/v1/properties" do
    it "returns paginated properties" do
      get "/api/v1/properties", params: { per_page: 10 }
      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json["data"].length).to eq(10)
      expect(json["meta"]["total_count"]).to eq(15)
      expect(json["meta"]["total_pages"]).to eq(2)
    end

    it "filters by property_type" do
      create(:property, property_type: "apartment")
      get "/api/v1/properties", params: { property_type: "apartment" }
      json = JSON.parse(response.body)
      expect(json["data"]).to all(include("property_type" => "apartment"))
    end

    it "filters by bedrooms" do
      create(:property, bedrooms: 3)
      get "/api/v1/properties", params: { bedrooms: 3 }
      json = JSON.parse(response.body)
      expect(json["data"]).to all(include("bedrooms" => 3))
    end

    it "filters by price range" do
      create(:property, price: 1_000_000)
      create(:property, price: 5_000_000)
      get "/api/v1/properties", params: { min_price: 2_000_000, max_price: 6_000_000 }
      json = JSON.parse(response.body)
      prices = json["data"].map { |p| p["price"] }
      expect(prices).to all(be_between(2_000_000, 6_000_000))
    end

    it "searches by text query" do
      create(:property, title: "Unique Oceanfront Gem")
      get "/api/v1/properties", params: { q: "Oceanfront" }
      json = JSON.parse(response.body)
      titles = json["data"].map { |p| p["title"] }
      expect(titles).to include("Unique Oceanfront Gem")
    end

    it "marks watchlisted properties when authenticated" do
      property = properties.last
      WatchlistItem.create!(user: user, property: property)
      get "/api/v1/properties", headers: auth_headers
      json = JSON.parse(response.body)
      watchlisted = json["data"].find { |p| p["id"].to_s == property.id.to_s }
      expect(watchlisted).to be_present
      expect(watchlisted["is_watchlisted"]).to be true
    end
  end

  describe "GET /api/v1/properties/:id" do
    it "returns a single property" do
      property = properties.first
      get "/api/v1/properties/#{property.id}"
      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json["data"]["id"]).to eq(property.id)
    end

    it "returns 404 for non-existent property" do
      get "/api/v1/properties/999999"
      expect(response).to have_http_status(:not_found)
    end
  end
end

# spec/requests/api/v1/watchlist_spec.rb
RSpec.describe "Api::V1::Watchlist", type: :request do
  let!(:user)     { create(:user) }
  let!(:property) { create(:property) }
  let(:auth_headers) do
    token = JwtService.encode(user_id: user.id)
    { "Authorization" => "Bearer #{token}", "Content-Type" => "application/json" }
  end

  describe "GET /api/v1/watchlist" do
    it "requires authentication" do
      get "/api/v1/watchlist"
      expect(response).to have_http_status(:unauthorized)
    end

    it "returns user's watchlisted properties" do
      WatchlistItem.create!(user: user, property: property)
      get "/api/v1/watchlist", headers: auth_headers
      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json["data"].length).to eq(1)
      expect(json["data"].first["id"]).to eq(property.id)
    end
  end

  describe "POST /api/v1/watchlist" do
    it "adds a property to the watchlist" do
      post "/api/v1/watchlist",
           params: { property_id: property.id }.to_json,
           headers: auth_headers
      expect(response).to have_http_status(:created)
      expect(WatchlistItem.exists?(user: user, property: property)).to be true
    end

    it "prevents duplicates" do
      WatchlistItem.create!(user: user, property: property)
      post "/api/v1/watchlist",
           params: { property_id: property.id }.to_json,
           headers: auth_headers
      expect(response).to have_http_status(:unprocessable_entity)
    end
  end

  describe "DELETE /api/v1/watchlist/:property_id" do
    it "removes a property from the watchlist" do
      WatchlistItem.create!(user: user, property: property)
      delete "/api/v1/watchlist/#{property.id}", headers: auth_headers
      expect(response).to have_http_status(:ok)
      expect(WatchlistItem.exists?(user: user, property: property)).to be false
    end

    it "returns 404 when item not in watchlist" do
      delete "/api/v1/watchlist/#{property.id}", headers: auth_headers
      expect(response).to have_http_status(:not_found)
    end
  end
end

# spec/requests/api/v1/auth_spec.rb
RSpec.describe "Api::V1::Auth", type: :request do
  describe "POST /api/v1/auth/register" do
    let(:valid_params) do
      {
        user: {
          email:      "new@example.com",
          password:   "password123",
          first_name: "Jane",
          last_name:  "Doe"
        }
      }
    end

    it "creates a new user and returns a token" do
      post "/api/v1/auth/register",
           params: valid_params.to_json,
           headers: { "Content-Type" => "application/json" }
      expect(response).to have_http_status(:created)
      json = JSON.parse(response.body)
      expect(json["data"]["token"]).to be_present
      expect(json["data"]["user"]["email"]).to eq("new@example.com")
    end

    it "rejects duplicate email" do
      create(:user, email: "new@example.com")
      post "/api/v1/auth/register",
           params: valid_params.to_json,
           headers: { "Content-Type" => "application/json" }
      expect(response).to have_http_status(:unprocessable_entity)
    end
  end

  describe "POST /api/v1/auth/login" do
    let!(:user) { create(:user, email: "test@example.com", password: "password123") }

    it "returns a token for valid credentials" do
      post "/api/v1/auth/login",
           params: { auth: { email: "test@example.com", password: "password123" } }.to_json,
           headers: { "Content-Type" => "application/json" }
      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json["data"]["token"]).to be_present
    end

    it "rejects invalid password" do
      post "/api/v1/auth/login",
           params: { auth: { email: "test@example.com", password: "wrong" } }.to_json,
           headers: { "Content-Type" => "application/json" }
      expect(response).to have_http_status(:unauthorized)
    end
  end
end

# spec/models/property_spec.rb
RSpec.describe Property, type: :model do
  describe "validations" do
    it { should validate_presence_of(:title) }
    it { should validate_presence_of(:price) }
    it { should validate_presence_of(:property_type) }
    it { should validate_inclusion_of(:property_type).in_array(Property::PROPERTY_TYPES) }
    it { should validate_numericality_of(:price).is_greater_than(0) }
  end

  describe "scopes" do
    let!(:active_house)    { create(:property, status: "active",    property_type: "house",     price: 10_000_000) }
    let!(:active_condo)    { create(:property, status: "active",    property_type: "condo",     price: 5_000_000) }
    let!(:sold_property)   { create(:property, status: "sold",      property_type: "house",     price: 8_000_000) }
    let!(:featured)        { create(:property, status: "active",    is_featured: true) }

    it ".active returns only active properties" do
      expect(Property.active).to include(active_house, active_condo)
      expect(Property.active).not_to include(sold_property)
    end

    it ".featured returns featured properties" do
      expect(Property.featured).to include(featured)
    end

    it ".min_price filters by minimum price" do
      expect(Property.min_price(8_000_000)).to include(active_house)
      expect(Property.min_price(8_000_000)).not_to include(active_condo)
    end

    it ".max_price filters by maximum price" do
      expect(Property.max_price(6_000_000)).to include(active_condo)
      expect(Property.max_price(6_000_000)).not_to include(active_house)
    end
  end
end

# spec/factories/users.rb
FactoryBot.define do
  factory :user do
    email      { Faker::Internet.unique.email }
    password   { "password123" }
    first_name { Faker::Name.first_name }
    last_name  { Faker::Name.last_name }
  end
end

# spec/factories/properties.rb
FactoryBot.define do
  factory :property do
    title         { Faker::Lorem.words(number: 3).join(" ").capitalize }
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
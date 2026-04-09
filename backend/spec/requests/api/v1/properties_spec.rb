# spec/requests/api/v1/properties_spec.rb
require "faker"
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

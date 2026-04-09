# spec/requests/api/v1/watchlist_spec.rb
require "faker"
require "rails_helper"

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

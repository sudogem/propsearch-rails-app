# spec/requests/api/v1/auth_spec.rb
require "faker"
require "rails_helper"

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

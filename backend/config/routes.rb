Rails.application.routes.draw do
  # ActionCable WebSocket endpoint
  mount ActionCable.server => "/cable"

  namespace :api do
    namespace :v1 do
      # Authentication
      post   "auth/register",  to: "auth#register"
      post   "auth/login",     to: "auth#login"
      delete "auth/logout",    to: "auth#logout"
      get    "auth/me",        to: "auth#me"

      # Properties (public read, protected write)
      resources :properties, only: [ :index, :show, :create, :update, :destroy ] do
        collection do
          get :featured
        end
      end

      # Watchlist (authenticated)
      resources :watchlist, only: [ :index, :create, :destroy ], param: :property_id

      # Health check
      get "health", to: "health#index"
    end
  end
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

  # Render dynamic PWA files from app/views/pwa/*
  get "service-worker" => "rails/pwa#service_worker", as: :pwa_service_worker
  get "manifest" => "rails/pwa#manifest", as: :pwa_manifest

  # Defines the root path route ("/")
  # root "posts#index"
end

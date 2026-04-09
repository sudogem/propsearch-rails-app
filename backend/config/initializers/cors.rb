# config/initializers/cors.rb
Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    # origins ENV.fetch("ALLOWED_ORIGINS", "http://localhost:3000").split(",")
    origins ENV.fetch("ALLOWED_ORIGINS", "http://localhost:3000,http://localhost:5173,http://localhost:5174").split(",")

    resource "*",
      headers: :any,
      methods: [ :get, :post, :put, :patch, :delete, :options, :head ],
      expose:  [ "Authorization" ],
      credentials: false
  end
end

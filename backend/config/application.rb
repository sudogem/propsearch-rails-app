require_relative "boot"

require "cgi"
require "rails/all"

# Require the gems listed in Gemfile, including any gems
# you've limited to :test, :development, or :production.
Bundler.require(*Rails.groups)

# Dotenv::Railtie.load
# Dotenv::Railtie.load unless Rails.env.production? # deprecated in favor of Dotenv::Rails.load
Dotenv::Rails.load unless Rails.env.production?

module Backend
  class Application < Rails::Application
    # Initialize configuration defaults for originally generated Rails version.
    config.load_defaults 7.2

    # Please, add to the `ignore` list any other `lib` subdirectories that do
    # not contain `.rb` files, or that should not be reloaded or eager loaded.
    # Common ones are `templates`, `generators`, or `middleware`, for example.
    config.autoload_lib(ignore: %w[assets tasks])

    # Configuration for the application, engines, and railties goes here.
    #
    # These settings can be overridden in specific environments using the files
    # in config/environments, which are processed later.
    #
    # config.time_zone = "Central Time (US & Canada)"
    # config.eager_load_paths << Rails.root.join("extras")

    # API-only mode
    config.api_only = true

    # CORS configuration (detailed in initializers/cors.rb)
    config.middleware.insert_before 0, Rack::Cors

    # Time zone
    config.time_zone = "UTC"

    # ActionCable
    config.action_cable.mount_path = "/cable"
  end
end

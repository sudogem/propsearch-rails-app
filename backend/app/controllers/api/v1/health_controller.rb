module Api
  module V1
    class HealthController < BaseController
      # GET /api/v1/health
      def index
        render_success({ status: "ok" })
      end
    end
  end
end

# frozen_string_literal: true

module Api
  module V1
    class BaseController < ActionController::API
      include ActionController::HttpAuthentication::Token::ControllerMethods

      before_action :set_default_format

      # Error handling
      rescue_from ActiveRecord::RecordNotFound,       with: :not_found
      rescue_from ActiveRecord::RecordInvalid,        with: :unprocessable_entity
      rescue_from ActionController::ParameterMissing, with: :bad_request
      rescue_from ::AuthenticationError,              with: :unauthorized

      private

      # ── Authentication helpers ──────────────────────────────────────

      def authenticate_user!
        token = extract_token
        raise ::AuthenticationError, "Token missing" unless token

        payload = JwtService.decode(token)
        @current_user = User.find(payload[:user_id])
      rescue ActiveRecord::RecordNotFound
        raise ::AuthenticationError, "User not found"
      end

      def current_user
        @current_user
      end

      def set_current_user
        token = extract_token
        return unless token

        payload = JwtService.decode(token)
        @current_user = User.find(payload[:user_id])
      rescue ActiveRecord::RecordNotFound, ::AuthenticationError
        @current_user = nil
      end

      def extract_token
        # Support Bearer token in Authorization header
        header = request.headers["Authorization"]
        header.split(" ").last if header&.start_with?("Bearer ")
      end

      # ── Response helpers ────────────────────────────────────────────

      def render_success(data, status: :ok, meta: nil)
        payload = { data: data }
        payload[:meta] = meta if meta
        render json: payload, status: status
      end

      def render_error(message, status: :unprocessable_entity, errors: nil)
        payload = { error: message }
        payload[:errors] = errors if errors
        render json: payload, status: status
      end

      def render_paginated(collection, serializer_method, pagy)
        render_success(
          collection.map { |r| send(serializer_method, r) },
          meta: pagination_meta(pagy)
        )
      end

      def pagination_meta(pagy)
        {
          current_page: pagy.page,
          total_pages:  pagy.pages,
          total_count:  pagy.count,
          per_page:     pagy.items,
          next_page:    pagy.next,
          prev_page:    pagy.prev
        }
      end

      # ── Error renderers ─────────────────────────────────────────────

      def not_found(e)
        render_error e.message, status: :not_found
      end

      def unprocessable_entity(e)
        render_error "Validation failed", status: :unprocessable_entity,
                     errors: e.record.errors.full_messages
      end

      def bad_request(e)
        render_error e.message, status: :bad_request
      end

      def unauthorized(e)
        render_error e.message, status: :unauthorized
      end

      def set_default_format
        request.format = :json
      end
    end
  end
end

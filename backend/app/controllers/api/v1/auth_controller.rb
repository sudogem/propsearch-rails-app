# frozen_string_literal: true

module Api
  module V1
    class AuthController < BaseController
      before_action :authenticate_user!, only: [ :logout, :me ]

      # POST /api/v1/auth/register
      def register
        user = User.new(register_params)
        if user.save
          token = JwtService.encode(user_id: user.id)
          render_success({ user: serialize_user(user), token: token }, status: :created)
        else
          render_error "Registration failed", errors: user.errors.full_messages
        end
      end

      # POST /api/v1/auth/login
      def login
        user = User.find_by(email: login_params[:email]&.downcase)
        if user&.authenticate(login_params[:password])
          token = JwtService.encode(user_id: user.id)
          render_success({ user: serialize_user(user), token: token })
        else
          render_error "Invalid email or password", status: :unauthorized
        end
      end

      # DELETE /api/v1/auth/logout
      def logout
        # JWT is stateless; client must discard the token.
        # For production: maintain a token denylist in Redis.
        render_success({ message: "Logged out successfully" })
      end

      # GET /api/v1/auth/me
      def me
        render_success(serialize_user(current_user))
      end

      private

      def register_params
        params.require(:user).permit(:email, :password, :first_name, :last_name)
      end

      def login_params
        params.require(:auth).permit(:email, :password)
      end

      def serialize_user(user)
        {
          id:         user.id,
          email:      user.email,
          first_name: user.first_name,
          last_name:  user.last_name,
          full_name:  user.full_name,
          created_at: user.created_at
        }
      end
    end
  end
end

# frozen_string_literal: true

class JwtService
  SECRET_KEY = Rails.application.secret_key_base
  EXPIRY     = 24.hours

  def self.encode(payload, exp = EXPIRY.from_now)
    payload[:exp] = exp.to_i
    JWT.encode(payload, SECRET_KEY, "HS256")
  end

  def self.decode(token)
    decoded = JWT.decode(token, SECRET_KEY, true, algorithm: "HS256")
    HashWithIndifferentAccess.new(decoded.first)
  rescue JWT::ExpiredSignature
    raise ::AuthenticationError, "Token has expired"
  rescue JWT::DecodeError => e
    raise ::AuthenticationError, "Invalid token: #{e.message}"
  end
end

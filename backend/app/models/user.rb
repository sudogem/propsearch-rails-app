# frozen_string_literal: true

class User < ApplicationRecord
  has_secure_password

  has_many :watchlist_items, dependent: :destroy
  has_many :watchlisted_properties, through: :watchlist_items, source: :property

  # Validations
  validates :email,      presence: true,
                         uniqueness: { case_sensitive: false },
                         format: { with: URI::MailTo::EMAIL_REGEXP }
  validates :first_name, presence: true, length: { minimum: 1, maximum: 50 }
  validates :last_name,  presence: true, length: { minimum: 1, maximum: 50 }
  validates :password,   length: { minimum: 8 }, if: -> { new_record? || password.present? }

  before_save :downcase_email

  def full_name
    "#{first_name} #{last_name}"
  end

  private

  def downcase_email
    self.email = email.downcase
  end
end

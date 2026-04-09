# frozen_string_literal: true

class Property < ApplicationRecord
  has_many :watchlist_items, dependent: :destroy
  has_many :watchers, through: :watchlist_items, source: :user

  PROPERTY_TYPES = %w[house apartment townhouse condo land commercial].freeze
  STATUSES       = %w[active sold rented].freeze

  # Validations
  validates :title,         presence: true, length: { minimum: 5, maximum: 200 }
  validates :property_type, presence: true, inclusion: { in: PROPERTY_TYPES }
  validates :status,        presence: true, inclusion: { in: STATUSES }
  validates :price,         presence: true, numericality: { greater_than: 0 }
  validates :bedrooms,      numericality: { only_integer: true, greater_than_or_equal_to: 0 }
  validates :bathrooms,     numericality: { only_integer: true, greater_than_or_equal_to: 0 }
  validates :address,       presence: true
  validates :city,          presence: true

  # Scopes for filtering
  scope :active,          -> { where(status: "active") }
  scope :featured,        -> { where(is_featured: true) }
  scope :by_type,         ->(type) { where(property_type: type) if type.present? }
  scope :by_bedrooms,     ->(beds) { where(bedrooms: beds) if beds.present? }
  scope :min_price,       ->(price) { where("price >= ?", price) if price.present? }
  scope :max_price,       ->(price) { where("price <= ?", price) if price.present? }
  scope :by_city,         ->(city) { where("city ILIKE ?", "%#{city}%") if city.present? }
  scope :recent,          -> { order(created_at: :desc) }
  scope :price_asc,       -> { order(price: :asc) }
  scope :price_desc,      -> { order(price: :desc) }

  # Full-text search across title, description, address, city
  scope :search_text, ->(query) {
    if query.present?
      where(
        "title ILIKE :q OR description ILIKE :q OR address ILIKE :q OR city ILIKE :q",
        q: "%#{query}%"
      )
    end
  }

  # Combined filter scope used by the controller
  def self.filter(params)
    scope = active
    scope = scope.search_text(params[:q])
    scope = scope.by_type(params[:property_type])
    scope = scope.by_city(params[:city])
    scope = scope.by_bedrooms(params[:bedrooms])
    scope = scope.min_price(params[:min_price])
    scope = scope.max_price(params[:max_price])
    scope = apply_sort(scope, params[:sort])
    scope
  end

  def self.apply_sort(scope, sort)
    case sort
    when "price_asc"   then scope.price_asc
    when "price_desc"  then scope.price_desc
    when "newest"      then scope.recent
    else scope.recent
    end
  end

  # Convenience: check if a user has watchlisted this property
  def watchlisted_by?(user)
    return false unless user
    watchlist_items.exists?(user: user)
  end
end

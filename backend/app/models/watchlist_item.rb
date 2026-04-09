# frozen_string_literal: true

class WatchlistItem < ApplicationRecord
  belongs_to :user
  belongs_to :property

  validates :user_id,     presence: true
  validates :property_id, presence: true,
                          uniqueness: { scope: :user_id, message: "is already in your watchlist" }
end

class CreateProperties < ActiveRecord::Migration[7.2]
  def change
    create_table :properties do |t|
      t.string  :title,         null: false
      t.text    :description
      t.string  :property_type, null: false   # house, apartment, townhouse, condo, land
      t.string  :status,        null: false, default: 'active'  # active, sold, rented
      t.decimal :price,         null: false, precision: 12, scale: 2
      t.integer :bedrooms,      null: false, default: 0
      t.integer :bathrooms,     null: false, default: 0
      t.integer :area_sqm
      t.integer :parking_spaces, default: 0
      t.boolean :is_featured,   default: false

      # Location
      t.string  :address,       null: false
      t.string  :city,          null: false
      t.string  :state
      t.string  :country,       null: false, default: 'Philippines'
      t.string  :postal_code
      t.decimal :latitude,      precision: 10, scale: 6
      t.decimal :longitude,     precision: 10, scale: 6

      # Media
      t.string  :primary_image_url
      t.jsonb   :images,        default: []
      t.jsonb   :amenities,     default: []

      t.timestamps
    end

    # Performance indexes on searchable/filterable fields
    add_index :properties, :property_type
    add_index :properties, :price
    add_index :properties, :bedrooms
    add_index :properties, :status
    add_index :properties, :city
    add_index :properties, :is_featured
    add_index :properties, :created_at
    # Composite index for common filter combos
    add_index :properties, [ :status, :property_type, :price ]
    add_index :properties, [ :status, :bedrooms, :price ]
  end
end

# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[7.2].define(version: 2026_04_06_143536) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "properties", force: :cascade do |t|
    t.string "title", null: false
    t.text "description"
    t.string "property_type", null: false
    t.string "status", default: "active", null: false
    t.decimal "price", precision: 12, scale: 2, null: false
    t.integer "bedrooms", default: 0, null: false
    t.integer "bathrooms", default: 0, null: false
    t.integer "area_sqm"
    t.integer "parking_spaces", default: 0
    t.boolean "is_featured", default: false
    t.string "address", null: false
    t.string "city", null: false
    t.string "state"
    t.string "country", default: "Philippines", null: false
    t.string "postal_code"
    t.decimal "latitude", precision: 10, scale: 6
    t.decimal "longitude", precision: 10, scale: 6
    t.string "primary_image_url"
    t.jsonb "images", default: []
    t.jsonb "amenities", default: []
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["bedrooms"], name: "index_properties_on_bedrooms"
    t.index ["city"], name: "index_properties_on_city"
    t.index ["created_at"], name: "index_properties_on_created_at"
    t.index ["is_featured"], name: "index_properties_on_is_featured"
    t.index ["price"], name: "index_properties_on_price"
    t.index ["property_type"], name: "index_properties_on_property_type"
    t.index ["status", "bedrooms", "price"], name: "index_properties_on_status_and_bedrooms_and_price"
    t.index ["status", "property_type", "price"], name: "index_properties_on_status_and_property_type_and_price"
    t.index ["status"], name: "index_properties_on_status"
  end

  create_table "users", force: :cascade do |t|
    t.string "email", null: false
    t.string "password_digest", null: false
    t.string "first_name", null: false
    t.string "last_name", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["email"], name: "index_users_on_email", unique: true
  end

  create_table "watchlist_items", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.bigint "property_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["property_id"], name: "index_watchlist_items_on_property_id"
    t.index ["user_id", "property_id"], name: "index_watchlist_items_on_user_id_and_property_id", unique: true
    t.index ["user_id"], name: "index_watchlist_items_on_user_id"
  end

  add_foreign_key "watchlist_items", "properties"
  add_foreign_key "watchlist_items", "users"
end

class CreateWatchlistItems < ActiveRecord::Migration[7.2]
  def change
    create_table :watchlist_items do |t|
      t.references :user,     null: false, foreign_key: true
      t.references :property, null: false, foreign_key: true
      t.timestamps
    end
    add_index :watchlist_items, [ :user_id, :property_id ], unique: true
  end
end

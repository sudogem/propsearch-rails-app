# frozen_string_literal: true

module Api
  module V1
    class WatchlistController < BaseController
      include Pagy::Backend

      before_action :authenticate_user!

      # GET /api/v1/watchlist
      def index
        properties = current_user.watchlisted_properties.active.recent
        pagy, records = pagy(properties, items: per_page, page: current_page)

        data = records.map { |p| serialize_property(p) }
        render_success(data, meta: pagination_meta(pagy))
      end

      # POST /api/v1/watchlist
      def create
        property = Property.find(params[:property_id])
        item = current_user.watchlist_items.build(property: property)

        if item.save
          # Broadcast update via ActionCable
          broadcast_watchlist_update(property, :added)
          render_success({ message: "Added to watchlist", property_id: property.id }, status: :created)
        else
          render_error item.errors.full_messages.first
        end
      end

      # DELETE /api/v1/watchlist/:property_id
      def destroy
        item = current_user.watchlist_items.find_by!(property_id: params[:property_id])
        property = item.property
        item.destroy

        broadcast_watchlist_update(property, :removed)
        render_success({ message: "Removed from watchlist", property_id: property.id })
      end

      private

      def current_page
        (params[:page] || 1).to_i
      end

      def per_page
        12
      end

      def broadcast_watchlist_update(property, action)
        ActionCable.server.broadcast(
          "watchlist_#{current_user.id}",
          {
            action:      action,
            property_id: property.id,
            title:       property.title,
            price:       property.price.to_f,
            timestamp:   Time.current
          }
        )
      end

      def serialize_property(property)
        {
          id:               property.id,
          title:            property.title,
          description:      property.description,
          property_type:    property.property_type,
          status:           property.status,
          price:            property.price.to_f,
          bedrooms:         property.bedrooms,
          bathrooms:        property.bathrooms,
          area_sqm:         property.area_sqm,
          address:          property.address,
          city:             property.city,
          primary_image_url: property.primary_image_url,
          images:           property.images || [],
          amenities:        property.amenities || [],
          is_watchlisted:   true,
          watcher_count:    property.watchlist_items.count,
          created_at:       property.created_at
        }
      end
    end
  end
end

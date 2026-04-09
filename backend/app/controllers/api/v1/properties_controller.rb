# frozen_string_literal: true

module Api
  module V1
    class PropertiesController < BaseController
      include Pagy::Backend

      before_action :authenticate_user!, only: [ :create, :update, :destroy ]
      before_action :set_current_user, only: [ :index, :show ]
      before_action :set_property, only: [ :show, :update, :destroy ]

      # GET /api/v1/properties
      # Query params: q, property_type, city, bedrooms, min_price, max_price, sort, page, per_page
      def index
        properties = Property.filter(filter_params)
        pagy, records = pagy(properties, items: per_page, page: current_page)

        # Determine which properties are watchlisted by the current user
        watchlisted_ids = watchlisted_property_ids(records)

        data = records.map { |p| serialize_property(p, watchlisted: watchlisted_ids.include?(p.id)) }
        render_success(data, meta: pagination_meta(pagy))
      end

      # GET /api/v1/properties/featured
      def featured
        properties = Property.featured.active.recent.limit(6)
        watchlisted_ids = watchlisted_property_ids(properties)
        data = properties.map { |p| serialize_property(p, watchlisted: watchlisted_ids.include?(p.id)) }
        render_success(data)
      end

      # GET /api/v1/properties/:id
      def show
        watchlisted = current_user ? @property.watchlisted_by?(current_user) : false
        render_success(serialize_property(@property, watchlisted: watchlisted))
      end

      # POST /api/v1/properties
      def create
        property = Property.new(property_params)
        if property.save
          render_success(serialize_property(property), status: :created)
        else
          render_error "Failed to create property", errors: property.errors.full_messages
        end
      end

      # PATCH/PUT /api/v1/properties/:id
      def update
        if @property.update(property_params)
          render_success(serialize_property(@property))
        else
          render_error "Failed to update property", errors: @property.errors.full_messages
        end
      end

      # DELETE /api/v1/properties/:id
      def destroy
        @property.destroy
        render_success({ message: "Property deleted successfully" })
      end

      private

      def set_property
        @property = Property.find(params[:id])
      end

      def filter_params
        params.permit(:q, :property_type, :city, :bedrooms, :min_price, :max_price, :sort)
      end

      def property_params
        params.require(:property).permit(
          :title, :description, :property_type, :status, :price,
          :bedrooms, :bathrooms, :area_sqm, :parking_spaces, :is_featured,
          :address, :city, :state, :country, :postal_code,
          :latitude, :longitude, :primary_image_url,
          images: [], amenities: []
        )
      end

      def current_page
        (params[:page] || 1).to_i
      end

      def per_page
        [ [ params[:per_page].to_i, 1 ].max, 50 ].min.then { |n| n.positive? ? n : 12 }
      end

      def watchlisted_property_ids(properties)
        return [] unless current_user
        property_ids = properties.map(&:id)
        WatchlistItem.where(user: current_user, property_id: property_ids).pluck(:property_id)
      end

      def serialize_property(property, watchlisted: false)
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
          parking_spaces:   property.parking_spaces,
          is_featured:      property.is_featured,
          address:          property.address,
          city:             property.city,
          state:            property.state,
          country:          property.country,
          postal_code:      property.postal_code,
          latitude:         property.latitude&.to_f,
          longitude:        property.longitude&.to_f,
          primary_image_url: property.primary_image_url,
          images:           property.images || [],
          amenities:        property.amenities || [],
          is_watchlisted:   watchlisted,
          watcher_count:    property.watchlist_items.count,
          created_at:       property.created_at,
          updated_at:       property.updated_at
        }
      end
    end
  end
end

class AdminController < ApplicationController
  def new_race_route
    # @routes = Route.all
  end

  def route_to_points
    points_query = route_to_points_query(route_to_points_params)
    @points = Point.find_by_sql(points_query)
  end

  private

  # Never trust parameters from the scary internet, only allow the white list through.
  def route_to_points_params
    params.require(:route).permit(:routeid)
  end

  def route_to_points_query(routeid)
    %( SELECT routeid, pointid, lng, lat
         FROM points
         WHERE routeid='#{routeid[:routeid]}'; )
  end
end

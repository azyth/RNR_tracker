class WelcomeController < ApplicationController
  # Select the most recent location based on the timestamp
  RECENT_UPDATE_QUERY = 'SELECT r.raceid, r.bib, r.latitude, r.longitude, r.time
                                     FROM ( SELECT raceid, bib, MAX(time) AS recentTime
                                            FROM race_events
                                            GROUP BY raceid, bib ) tmp
                                     JOIN race_events r ON tmp.bib = r.bib
                                     AND tmp.recentTime = r.time;'
  def main
    @racers = RaceEvent.find_by_sql(RECENT_UPDATE_QUERY)

    @races = Race.all
    @routes = Route.all
  end

  def updated_coords
    @racers = {}
    @temp = RaceEvent.find_by_sql(RECENT_UPDATE_QUERY)

    @temp.each do |racer|
      key = racer.bib
      # => {:key=>racer}
      @racers.store(key, racer)
    end
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

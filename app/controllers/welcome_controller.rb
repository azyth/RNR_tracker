class WelcomeController < ApplicationController

  def index
  end

  # Select the most recent location based on the timestamp
  RECENT_UPDATE_QUERY = "SELECT r.raceid, r.bib, r.latitude, r.longitude, r.time
                                     FROM ( SELECT raceid, bib, MAX(time) AS recentTime
                                            FROM race_events
                                            GROUP BY raceid, bib ) tmp
                                     JOIN race_events r ON tmp.bib = r.bib
                                     AND tmp.recentTime = r.time"
  def main
    @racers = RaceEvent.find_by_sql(RECENT_UPDATE_QUERY);
  end

end

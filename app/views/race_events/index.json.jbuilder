json.array!(@race_events) do |race_event|
  json.extract! race_event, :id, :raceid, :bib, :time, :latitude, :longitude
  json.url race_event_url(race_event, format: :json)
end

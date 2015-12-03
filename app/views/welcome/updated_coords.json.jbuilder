json.array!(@temp) do |racer|
  json.extract! racer, :id, :raceid, :bib, :time, :latitude, :longitude
  # json.url point_url(racer, format: :json)
end
json.array!(@races) do |race|
  json.extract! race, :id, :raceid, :routeid
  json.url race_url(race, format: :json)
end

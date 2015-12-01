json.array!(@points) do |point|
  json.extract! point, :id, :routeid, :pointid, :lng, :lat
  # json.url point_url(point, format: :json)
end

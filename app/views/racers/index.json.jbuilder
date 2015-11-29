json.array!(@racers) do |racer|
  json.extract! racer, :id, :email, :raceid, :bib, :iscurrent
  json.url racer_url(racer, format: :json)
end

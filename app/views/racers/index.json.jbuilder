json.array!(@racers) do |racer|
  json.extract! racer, :id, :firstname, :lastname, :email, :raceid, :bib, :iscurrent
  json.url racer_url(racer, format: :json)
end

# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rake db:seed (or created alongside the db with db:setup).
#
# Examples:
#
#   cities = City.create([{ name: 'Chicago' }, { name: 'Copenhagen' }])
#   Mayor.create(name: 'Emanuel', city: cities.first)
def rand_latitude
  rand(-100..100)
end
def rand_longitude
  rand(-100..100)
end

RaceEvent.delete_all

# Fill race_events with random locations
# Note: This table will be populated by the information received from the phone
100.times do |count|
  t1 = DateTime.civil_from_format :local, 2015, 10, 27, 1, 5, 23
  t2 = DateTime.civil_from_format :local, 2015, 10, 27, 1, 6, 16

  RaceEvent.create(raceid: "Race1", bib: count + 1, time: t1, latitude: rand_latitude, longitude: rand_longitude)
  RaceEvent.create(raceid: "Race1", bib: count + 1, time: t2, latitude: rand_latitude, longitude: rand_longitude)
end


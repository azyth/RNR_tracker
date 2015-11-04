class CreateRaceEvents < ActiveRecord::Migration
  def change
    create_table :race_events do |t|
      t.string :raceid
      t.integer :bib
      t.datetime :time
      t.decimal :latitude, precision: 9, scale: 6
      t.decimal :longitude, precision: 9, scale: 6

      t.timestamps null: false
    end
  end
end

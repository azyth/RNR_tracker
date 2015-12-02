class CreatePoints < ActiveRecord::Migration
  def change
    create_table :points do |t|
      t.string :routeid
      t.string :pointid
      t.decimal :lng, precision: 9, scale: 6
      t.decimal :lat, precision: 9, scale: 6

      t.timestamps null: false
    end
  end
end

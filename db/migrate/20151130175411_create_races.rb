class CreateRaces < ActiveRecord::Migration
  def change
    create_table :races do |t|
      t.string :raceid
      t.string :routeid

      t.timestamps null: false
    end
  end
end

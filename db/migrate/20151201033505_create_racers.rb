class CreateRacers < ActiveRecord::Migration
  def change
    create_table :racers do |t|
      t.string :firstname
      t.string :lastname
      t.string :email
      t.string :raceid
      t.integer :bib
      t.boolean :iscurrent

      t.timestamps null: false
    end
  end
end

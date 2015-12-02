class CreateRoutes < ActiveRecord::Migration
  def change
    create_table :routes do |t|
      t.string :routeid

      t.timestamps null: false
    end
  end
end

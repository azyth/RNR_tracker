class Racer < ActiveRecord::Base
  require 'csv'

  def self.import(file)
    CSV.foreach(file.path, headers: true) do |row|
      racer_hash = row.to_hash
      racer = Racer.where("email = ?", racer_hash["email"])

      if racer.count == 1
        racer.first.update_attributes(racer_hash)
      else
        Racer.create!(racer_hash)
      end # end if !racer.nil?

    end # end CSV.foreach
  end # end self.import(file)
end

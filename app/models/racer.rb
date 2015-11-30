class Racer < ActiveRecord::Base
  require 'csv'

  def self.import(file)
    puts "\n\n\n\n\n##########\n"
    # puts file.meta
    puts "##########\n\n\n\n\n"
    CSV.foreach(file.path, headers: true) do |row|
      racer_hash = row.to_hash

      if racer_hash.keys.any? { |key| key.to_s.match("email")}
        puts "\n\n@@@@@@@@@@@@@@@@@@@@@@@@@@@\n\n"
      end

      racer = Racer.where("email = ?", racer_hash["email"])

      if racer.count == 1
        racer.first.update_attributes(racer_hash)
      else
        Racer.create!(racer_hash)
      end # end if !racer.nil?

    end # end CSV.foreach
  end # end self.import(file)
end

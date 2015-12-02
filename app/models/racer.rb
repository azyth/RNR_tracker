class Racer < ActiveRecord::Base
  require 'csv'

  def self.import(file)
    headers   = (CSV.open(file.path, 'r') { |f| f.first }).to_s
    strfname  = headers.match(/\bfirst(\s*name)?/i)[0].strip
    strlname  = headers.match(/\blast(\s*name)?/i)[0].strip
    stremail  = headers.match(/\be-?mail(\s*address)?/i)[0].strip
    strraceid = headers.match(/\b(race(\s*id)?)|(event(\s*id)?)/i)[0].strip
    strbib    = headers.match(/\bbib((\s*id)|(\s*number))?/i)[0].strip
    striscrnt = headers.match(/\bis(\s*current)?/i)[0].strip
    if strfname && strlname && stremail && strraceid && strbib && striscrnt
      CSV.foreach(file.path, headers: true) do |row|
        racer_hash = { :firstname => row[strfname], :lastname => row[strlname], :email => row[stremail], :raceid => row[strraceid], :bib => row[strbib], :iscurrent => row[striscrnt] }
        racer = Racer.where("email = ?", racer_hash[:email])

        if racer.count == 1
          racer.first.update_attributes(racer_hash)
        else
          Racer.create!(racer_hash)
        end

      end # end if headers match
    end # end CSV.foreach
  end # end self.import(file)
end

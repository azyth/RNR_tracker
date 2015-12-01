class Racer < ActiveRecord::Base
  require 'csv'

  def self.import(file)
    headers   = (CSV.open(file.path, 'r') { |f| f.first }).to_s
    strfname  = headers.match(/first( *name)?/i)[0].strip
    strlname  = headers.match(/last( *name)?/i)[0].strip
    stremail  = headers.match(/e-?mail/i)[0].strip
    strraceid = headers.match(/(race *id)|(event( *id)?)/i)[0].strip
    strbib    = headers.match(/bib( *id)?/i)[0].strip
    if strfname && strlname && stremail && strraceid && strbib
      CSV.foreach(file.path, headers: true) do |row|
        racer_hash = { :firstname => row[strfname], :lastname => row[strlname], :email => row[stremail], :raceid => row[strraceid], :bib => row[strbib]}
        racer = Racer.where("email = ?", racer_hash[stremail])

        if racer.count == 1
          racer.first.update_attributes(racer_hash)
        else
          Racer.create!(racer_hash)
        end # end if !racer.nil?
      end # end if headers match
    end # end CSV.foreach
  end # end self.import(file)
end

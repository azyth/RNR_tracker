class User < ActiveRecord::Base
  before_save { self.email = email.downcase }
  #Username
  validates :name, presence: true, length: {maximum: 50}
  #emial
  VALID_EMAIL_REGEX = /\A[\w+\-.]+@[a-z\d\-.]+\.[a-z]+\z/i
  validates :email, presence: true, length: { maximum: 255 },
            format: { with: VALID_EMAIL_REGEX },
            uniqueness: { case_sensitive: false }
  #PASSWORD
  has_secure_password
  validates :password, presence: true, length: { minimum: 6 }
end

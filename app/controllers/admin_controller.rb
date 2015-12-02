class AdminController < ApplicationController

  def new_race_route
    @races = Race.all
    @routes = Route.all
  end

  def admin

  end
end

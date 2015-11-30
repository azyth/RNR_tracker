require 'test_helper'

class AdminControllerTest < ActionController::TestCase
  test "should get new_race_route" do
    get :new_race_route
    assert_response :success
  end

end

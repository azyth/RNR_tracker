require 'test_helper'

class RacersControllerTest < ActionController::TestCase
  setup do
    @racer = racers(:one)
  end

  test "should get index" do
    get :index
    assert_response :success
    assert_not_nil assigns(:racers)
  end

  test "should get new" do
    get :new
    assert_response :success
  end

  test "should create racer" do
    assert_difference('Racer.count') do
      post :create, racer: { bib: @racer.bib, email: @racer.email, iscurrent: @racer.iscurrent, raceid: @racer.raceid }
    end

    assert_redirected_to racer_path(assigns(:racer))
  end

  test "should show racer" do
    get :show, id: @racer
    assert_response :success
  end

  test "should get edit" do
    get :edit, id: @racer
    assert_response :success
  end

  test "should update racer" do
    patch :update, id: @racer, racer: { bib: @racer.bib, email: @racer.email, iscurrent: @racer.iscurrent, raceid: @racer.raceid }
    assert_redirected_to racer_path(assigns(:racer))
  end

  test "should destroy racer" do
    assert_difference('Racer.count', -1) do
      delete :destroy, id: @racer
    end

    assert_redirected_to racers_path
  end
end
